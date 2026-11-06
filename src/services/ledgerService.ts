import { randomUUID } from "node:crypto";

export interface LedgerAdjustment {
  accountId: string;
  amountCents: number;
  direction: "credit" | "debit";
  memo?: string;
}

export interface LedgerResult {
  accountId: string;
  balanceCents: number;
}

export interface LedgerEvent {
  eventId: string;
  accountId: string;
  sequence: number;
  recordedAt: string;
  type: "ledger.credit" | "ledger.debit";
  amountCents: number;
  deltaCents: number;
  memo: string | null;
  balanceCents: number;
}

const DIRECTIONS = new Set<LedgerAdjustment["direction"]>(["credit", "debit"]);
const MAX_MEMO_LENGTH = 250;

/**
 * Known accounts this service manages, with their current balance in cents. A
 * real deployment loads these from the accounts service; they are seeded here as
 * a demo stand-in. The set is fixed, so it neither grows without bound nor evicts
 * a live balance.
 */
const balances = new Map<string, number>([
  ["acct_1001", 0],
  ["acct_1002", 0],
  ["acct_1003", 0],
]);

/** Applied adjustments per account, oldest first. */
const history = new Map<string, LedgerEvent[]>();

/**
 * Validate an untrusted adjustment. `accountId` comes from the route, the amount,
 * direction and optional memo from the request body. Returns a well-formed
 * LedgerAdjustment, or null when any field is missing, mistyped, or out of range
 * so the caller can answer HTTP 400 without the service ever seeing bad input.
 */
export function parseAdjustment(accountId: string, body: unknown): LedgerAdjustment | null {
  if (typeof accountId !== "string" || accountId.trim().length === 0) {
    return null;
  }
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const { amountCents, direction, memo } = body as Record<string, unknown>;
  if (
    !Number.isSafeInteger(amountCents) ||
    (amountCents as number) < 0 ||
    typeof direction !== "string" ||
    !DIRECTIONS.has(direction as LedgerAdjustment["direction"])
  ) {
    return null;
  }
  if (memo !== undefined && (typeof memo !== "string" || memo.length > MAX_MEMO_LENGTH)) {
    return null;
  }
  return {
    accountId,
    amountCents: amountCents as number,
    direction: direction as LedgerAdjustment["direction"],
    memo,
  };
}

/**
 * Apply a ledger adjustment to the named account, record it in the account's
 * history, and return its new balance, or null when the account is not one this
 * service manages.
 */
export function applyAdjustment(adjustment: LedgerAdjustment): LedgerResult | null {
  const current = balances.get(adjustment.accountId);
  if (current === undefined) {
    return null;
  }
  const delta = adjustment.direction === "debit" ? -adjustment.amountCents : adjustment.amountCents;
  const balanceCents = current + delta;
  if (!Number.isSafeInteger(balanceCents)) {
    throw new RangeError("ledger balance exceeds safe integer range");
  }
  balances.set(adjustment.accountId, balanceCents);

  const events = history.get(adjustment.accountId) ?? [];
  events.push({
    eventId: randomUUID(),
    accountId: adjustment.accountId,
    sequence: events.length + 1,
    recordedAt: new Date().toISOString(),
    type: adjustment.direction === "debit" ? "ledger.debit" : "ledger.credit",
    amountCents: adjustment.amountCents,
    deltaCents: delta,
    memo: adjustment.memo ?? null,
    balanceCents,
  });
  history.set(adjustment.accountId, events);

  return { accountId: adjustment.accountId, balanceCents };
}

/** Return the applied adjustments for an account, oldest first. */
export function getAdjustments(accountId: string): LedgerEvent[] {
  return [...(history.get(accountId) ?? [])];
}
