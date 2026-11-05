import { getAdjustments } from "./ledgerService";
import { getEventsForAccount } from "./billingWebhookService";

export interface StatementLine {
  eventId: string;
  recordedAt: string;
  type: string;
  reference: string;
  memo: string | null;
  deltaCents: number;
  balanceCents: number;
}

export interface StatementDailyBalance {
  date: string;
  balanceCents: number;
}

export interface Statement {
  accountId: string;
  from: string;
  to: string;
  openingBalanceCents: number;
  closingBalanceCents: number;
  lines: StatementLine[];
  dailyBalances: StatementDailyBalance[];
}

interface Entry {
  source: number;
  sequence: number;
  time: number;
  eventId: string;
  recordedAt: string;
  type: string;
  memo: string | null;
  deltaCents: number;
}

const LEDGER_SOURCE = 0;
const BILLING_SOURCE = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const HAS_TIME = /\d:\d/;

function addCents(balanceCents: number, deltaCents: number): number {
  const result = balanceCents + deltaCents;
  if (!Number.isSafeInteger(result)) {
    throw new RangeError("statement balance exceeds safe integer range");
  }
  return result;
}

/**
 * Build the statement for an account from `from` through `to`. A `to` without a
 * time covers that whole day. Merges ledger adjustments and billing events in
 * recorded order, ledger first on a timestamp tie. Returns null when either date
 * does not parse.
 */
export function buildStatement(accountId: string, from: string, to: string): Statement | null {
  const fromTime = new Date(from).getTime();
  const parsedTo = new Date(to).getTime();
  if (Number.isNaN(fromTime) || Number.isNaN(parsedTo)) {
    return null;
  }
  const toTime = HAS_TIME.test(to) ? parsedTo : parsedTo + DAY_MS;

  const entries: Entry[] = [
    ...getAdjustments(accountId).map((event) => ({
      source: LEDGER_SOURCE,
      sequence: event.sequence,
      time: Date.parse(event.recordedAt),
      eventId: event.eventId,
      recordedAt: event.recordedAt,
      type: event.type,
      memo: event.memo,
      deltaCents: event.deltaCents,
    })),
    ...getEventsForAccount(accountId).map((event) => ({
      source: BILLING_SOURCE,
      sequence: event.sequence,
      time: Date.parse(event.recordedAt),
      eventId: event.eventId,
      recordedAt: event.recordedAt,
      type: event.type,
      memo: null,
      deltaCents: event.deltaCents,
    })),
  ].sort((a, b) => a.time - b.time || a.source - b.source || a.sequence - b.sequence);

  let openingBalanceCents = 0;
  let balanceCents = 0;
  const lines: StatementLine[] = [];
  for (const entry of entries) {
    if (entry.time < fromTime) {
      openingBalanceCents = addCents(openingBalanceCents, entry.deltaCents);
      balanceCents = openingBalanceCents;
    } else if (entry.time < toTime) {
      balanceCents = addCents(balanceCents, entry.deltaCents);
      lines.push({
        eventId: entry.eventId,
        recordedAt: entry.recordedAt,
        type: entry.type,
        reference: entry.eventId,
        memo: entry.memo,
        deltaCents: entry.deltaCents,
        balanceCents,
      });
    }
  }

  // Finance wants the closing balance for every calendar day in the window, so
  // the statement carries one entry per day across [from, to).
  const rangeEntries = entries.filter((entry) => entry.time >= fromTime && entry.time < toTime);
  const dailyBalances: StatementDailyBalance[] = [];
  let dayBalance = openingBalanceCents;
  let cursor = 0;
  for (let dayStart = fromTime; dayStart < toTime; dayStart += DAY_MS) {
    const dayEnd = dayStart + DAY_MS;
    while (cursor < rangeEntries.length && rangeEntries[cursor].time < dayEnd) {
      dayBalance = addCents(dayBalance, rangeEntries[cursor].deltaCents);
      cursor += 1;
    }
    dailyBalances.push({ date: new Date(dayStart).toISOString().slice(0, 10), balanceCents: dayBalance });
  }

  const statement: Statement = {
    accountId,
    from: new Date(fromTime).toISOString(),
    to: new Date(parsedTo).toISOString(),
    openingBalanceCents,
    closingBalanceCents: balanceCents,
    lines,
    dailyBalances,
  };
  console.info("statement generated", JSON.stringify(statement));
  return statement;
}
