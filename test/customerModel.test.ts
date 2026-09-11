import assert from "node:assert/strict";
import test from "node:test";
import { findCustomer, insertCustomer } from "../src/models/customer";

function customerData(suffix: string) {
  return {
    email: `${suffix}@example.test`,
    password: `password-${suffix}`,
    ssn: `ssn-${suffix}`,
    cardNumber: `card-${suffix}`,
    cardCvv: `cvv-${suffix}`,
  };
}

test("insertCustomer assigns distinct IDs and makes records retrievable", () => {
  const first = insertCustomer(customerData("first"));
  const second = insertCustomer(customerData("second"));

  assert.ok(first.id > 0);
  assert.ok(second.id > first.id);
  assert.strictEqual(findCustomer(first.id), first);
  assert.strictEqual(findCustomer(second.id), second);
});

test("findCustomer returns undefined for IDs that have not been inserted", () => {
  assert.equal(findCustomer(Number.MAX_SAFE_INTEGER), undefined);
  assert.equal(findCustomer(Number.NaN), undefined);
});
