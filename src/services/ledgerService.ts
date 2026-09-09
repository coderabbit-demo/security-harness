export interface LedgerAdjustment {
  accountId: string;
  amountCents: number;
  direction: "credit" | "debit";
}

export interface LedgerResult {
  accountId: string;
  balanceCents: number;
}

const DIRECTIONS = new Set<LedgerAdjustment["direction"]>(["credit", "debit"]);

/** Cap on tracked accounts, so an unbounded set of ids cannot exhaust memory. */
const MAX_TRACKED_ACCOUNTS = 10_000;

/** In-memory account balances, keyed by account id. Demo stand-in for a datastore. */
const balances = new Map<string, number>();

/**
 * Parse and validate an untrusted ledger payload. Returns a well-formed
 * LedgerAdjustment, or null when any field is missing, mistyped, or out of range
 * so the caller can answer HTTP 400 without the service ever seeing bad input.
 */
export function parseAdjustment(raw: unknown): LedgerAdjustment | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const { accountId, amountCents, direction } = raw as Record<string, unknown>;
  if (
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
    accountId,
    amountCents: amountCents as number,
    direction: direction as LedgerAdjustment["direction"],
  };
}

/**
 * Apply a ledger adjustment to the named account and return its new balance.
 */
export function applyAdjustment(adjustment: LedgerAdjustment): LedgerResult {
  const current = balances.get(adjustment.accountId) ?? 0;
  const delta = adjustment.direction === "debit" ? -adjustment.amountCents : adjustment.amountCents;
  const balanceCents = current + delta;
  if (!Number.isSafeInteger(balanceCents)) {
    throw new RangeError("ledger balance exceeds safe integer range");
  }
  balances.set(adjustment.accountId, balanceCents);
  // Bound memory: this in-memory ledger is a demo stand-in. Once the map exceeds
  // its cap, evict the oldest account (Map preserves insertion order) so an
  // unbounded set of account ids cannot exhaust memory.
  if (balances.size > MAX_TRACKED_ACCOUNTS) {
    const oldest = balances.keys().next().value;
    if (oldest !== undefined) {
      balances.delete(oldest);
    }
  }
  return { accountId: adjustment.accountId, balanceCents };
}
