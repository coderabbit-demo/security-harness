export interface LedgerAdjustment {
  requestId: string;
  accountId: string;
  amountCents: number;
  direction: "credit" | "debit";
}

export interface LedgerResult {
  accountId: string;
  balanceCents: number;
}

const DIRECTIONS = new Set<LedgerAdjustment["direction"]>(["credit", "debit"]);

/** In-memory account balances, keyed by account id. Demo stand-in for a datastore. */
const balances = new Map<string, number>();

/** Results of adjustments already applied, keyed by request id, for idempotency. */
const processed = new Map<string, LedgerResult>();

/**
 * Parse and validate an untrusted ledger payload. Returns a well-formed
 * LedgerAdjustment, or null when any field is missing, mistyped, or out of range
 * so the caller can answer HTTP 400 without the service ever seeing bad input.
 */
export function parseAdjustment(raw: unknown): LedgerAdjustment | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const { requestId, accountId, amountCents, direction } = raw as Record<string, unknown>;
  if (
    typeof requestId !== "string" ||
    requestId.length === 0 ||
    typeof accountId !== "string" ||
    accountId.length === 0 ||
    !Number.isSafeInteger(amountCents) ||
    (amountCents as number) < 0 ||
    typeof direction !== "string" ||
    !DIRECTIONS.has(direction as LedgerAdjustment["direction"])
  ) {
    return null;
  }
  return {
    requestId,
    accountId,
    amountCents: amountCents as number,
    direction: direction as LedgerAdjustment["direction"],
  };
}

/**
 * Apply a ledger adjustment to the named account and return its new balance.
 * Idempotent by request id: a repeated request id returns the first result
 * without moving the balance again.
 */
export function applyAdjustment(adjustment: LedgerAdjustment): LedgerResult {
  const seen = processed.get(adjustment.requestId);
  if (seen) {
    return seen;
  }
  const current = balances.get(adjustment.accountId) ?? 0;
  const delta = adjustment.direction === "debit" ? -adjustment.amountCents : adjustment.amountCents;
  const balanceCents = current + delta;
  if (!Number.isSafeInteger(balanceCents)) {
    throw new RangeError("ledger balance exceeds safe integer range");
  }
  balances.set(adjustment.accountId, balanceCents);
  const result: LedgerResult = { accountId: adjustment.accountId, balanceCents };
  processed.set(adjustment.requestId, result);
  return result;
}
