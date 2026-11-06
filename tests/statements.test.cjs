const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm, readdir } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { toCsv } = require('../dist/lib/csv');
const { buildStatement } = require('../dist/services/statementService');
const ledger = require('../dist/services/ledgerService');
const store = require('../dist/services/exportStore');
const { createApp } = require('../dist/app');

test('CSV neutralizes text formulas while retaining numeric cells and escaping', () => {
  assert.equal(toCsv([['=1+1', '+2', '-3', '@SUM(A1)', '\t=2', '  =3', -42, 0]]),
    "'=1+1,'+2,'-3,'@SUM(A1),'\t=2,'  =3,-42,0");
  assert.equal(toCsv([['a,b', 'a"b', 'a\nb', '=SUM(1,2)'], ['ordinary']]),
    '"a,b","a""b","a\nb","\'=SUM(1,2)"\r\nordinary');
});

test('statement windows are bounded before reading events; UTC buckets and logs are safe', (t) => {
  const events = [
    ['2026-11-01T11:00:00Z', 100],
    ['2026-11-01T23:59:59Z', 10],
    ['2026-11-02T00:00:00Z', -20],
    ['2026-11-02T13:00:00Z', 30],
    ['2026-11-03T11:00:00Z', 40],
    ['2026-11-03T12:00:00Z', 900],
  ].map(([recordedAt, deltaCents], sequence) => ({
    eventId: `event-${sequence}`, recordedAt, deltaCents, sequence,
    type: 'ledger.credit', memo: 'private memo',
  }));
  const adjustments = t.mock.method(ledger, 'getAdjustments', () => events);
  const logs = t.mock.method(console, 'info', () => {});
  for (const [from, to] of [
    ['bad', '2026-01-01'], ['2026-01-02', '2026-01-01'],
    ['2026-01-02T12:00:00Z', '2026-01-02'],
    ['2020-01-01', '2026-01-01'], ['2024-01-01', '2025-01-01'],
  ]) assert.equal(buildStatement('acct_1001', from, to), null);
  assert.equal(adjustments.mock.callCount(), 0);
  const statement = buildStatement('acct_1001', '2026-11-01T12:00:00Z', '2026-11-03T12:00:00Z');
  assert.equal(statement.openingBalanceCents, 100);
  assert.equal(statement.closingBalanceCents, 160);
  assert.deepEqual(statement.dailyBalances, [
    { date: '2026-11-01', balanceCents: 110 },
    { date: '2026-11-02', balanceCents: 120 },
    { date: '2026-11-03', balanceCents: 160 },
  ]);
  assert.deepEqual(logs.mock.calls[0].arguments, ['statement generated', { lineCount: 4 }]);
  assert.deepEqual(buildStatement('acct_1001', '2026-11-02T12:00:00Z', '2026-11-02T12:00:00Z').dailyBalances, []);
  assert.equal(buildStatement('acct_1001', '2024-01-01', '2024-12-31').dailyBalances.length, 366);
  assert.equal(buildStatement('acct_1001', '2026-11-02', '2026-11-02').lines.length, 2);
  assert.equal(buildStatement('acct_1001', '2026-11-02', '2026-11-03T00:00:00Z').dailyBalances.length, 1);
});

test('HTTP exports isolate accounts and reject unsafe filenames before storage access', async () => {
  const previous = process.cwd();
  const directory = await mkdtemp(join(tmpdir(), 'statement-test-'));
  process.chdir(directory);
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const request = (account, suffix) => fetch(`http://127.0.0.1:${server.address().port}/api/accounts/${account}/statement${suffix}`, {
    headers: { 'X-Account-Id': account },
  });
  const save = (account, name) => request(account, `?from=2026-01-01&to=2026-01-01&format=csv&filename=${encodeURIComponent(name)}`);
  const read = (account, name) => request(account, `/exports?filename=${encodeURIComponent(name)}`);
  try {
    for (const name of ['../escape.csv', '/tmp/escape.csv', '..\\escape.csv', '.', '..', 'a\r\nb', 'x'.repeat(201)]) {
      assert.equal((await save('acct_1001', name)).status, 400);
      assert.equal((await read('acct_1001', name)).status, 400);
      await assert.rejects(store.saveExport('acct_1001', name, 'bad'), /invalid export filename/);
      await assert.rejects(store.readExport('acct_1001', name), /invalid export filename/);
    }
    assert.deepEqual(await readdir(directory), []);
    const own = await save('acct_1001', 'shared.csv');
    assert.equal(own.status, 200);
    const csv = await own.text();
    assert.equal((await read('acct_1002', 'shared.csv')).status, 404);
    await store.saveExport('acct_1002', 'shared.csv', 'second account');
    assert.equal(await (await read('acct_1001', 'shared.csv')).text(), csv);
    assert.equal(await (await read('acct_1002', 'shared.csv')).text(), 'second account');
    assert.equal((await request('acct_1001', '?from=bad&to=bad')).status, 400);
    const mismatch = await fetch(`http://127.0.0.1:${server.address().port}/api/accounts/acct_1001/statement/exports?filename=shared.csv`, {
      headers: { 'X-Account-Id': 'acct_1002' },
    });
    assert.equal(mismatch.status, 403);
  } finally {
    await new Promise(resolve => server.close(resolve));
    process.chdir(previous);
    await rm(directory, { recursive: true, force: true });
  }
});
