import assert from "node:assert/strict";
import test from "node:test";
import {
  createAccount,
  getAccount,
  NewAccount,
} from "../src/services/customerService";

const analyticsUrl = "http://analytics.internal/track";

function accountInput(suffix: string): NewAccount {
  return {
    email: `${suffix}@example.test`,
    password: `password-${suffix}`,
    ssn: `ssn-${suffix}`,
    cardNumber: `card-${suffix}`,
    cardCvv: `cvv-${suffix}`,
  };
}

test("createAccount returns a public account result and stores the account", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ input: string | URL | Request; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(null, { status: 204 });
  };
  const input = accountInput("created");
  const inputSnapshot = { ...input };

  try {
    const result = await createAccount(input);

    assert.equal(result.email, input.email);
    assert.ok(result.id > 0);
    assert.ok(result.sessionToken.length > 0);
    assert.deepEqual(Object.keys(result).sort(), ["email", "id", "sessionToken"]);
    assert.deepEqual(input, inputSnapshot, "the caller's input should not be mutated");

    const stored = getAccount(result.id);
    assert.ok(stored);
    assert.equal(stored.id, result.id);
    assert.equal(stored.email, input.email);

    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), analyticsUrl);
    assert.equal(calls[0].init?.method, "POST");
    assert.equal(
      new Headers(calls[0].init?.headers).get("content-type"),
      "application/json",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("createAccount propagates an analytics failure to its caller", async () => {
  const originalFetch = globalThis.fetch;
  const analyticsError = new Error("analytics unavailable");
  globalThis.fetch = async () => {
    throw analyticsError;
  };

  try {
    await assert.rejects(createAccount(accountInput("failure")), analyticsError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("getAccount returns undefined for an unknown account", () => {
  assert.equal(getAccount(Number.MAX_SAFE_INTEGER), undefined);
});
