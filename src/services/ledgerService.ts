import { createHash, timingSafeEqual } from "node:crypto";

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

/** Authenticate a bearer credential scoped to the account in the route. */
export function authorizeLedgerAccount(accountId: string, authorization: string | undefined): boolean {
  const token = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(authorization ?? "")?.[1];
  if (!token) {
    return false;
  }

  let hashes: unknown;
  try {
    hashes = JSON.parse(process.env.LEDGER_ACCOUNT_TOKEN_HASHES ?? "");
  } catch {
    return false;
  }
  if (typeof hashes !== "object" || hashes === null || Array.isArray(hashes)) {
    return false;
  }

  const accountHash = Object.prototype.hasOwnProperty.call(hashes, accountId)
    ? (hashes as Record<string, unknown>)[accountId]
    : undefined;
  if (typeof accountHash !== "string" || !/^[a-f0-9]{64}$/.test(accountHash)) {
    return false;
  }

  const providedHash = createHash("sha256").update(token).digest();
  return timingSafeEqual(Buffer.from(accountHash, "hex"), providedHash);
}

/**
 * Validate an untrusted adjustment. `accountId` comes from the route, the amount
 * and direction from the request body. Returns a well-formed LedgerAdjustment, or
 * null when any field is missing, mistyped, or out of range so the caller can
 * answer HTTP 400 without the service ever seeing bad input.
 */
export function parseAdjustment(accountId: string, body: unknown): LedgerAdjustment | null {
  if (typeof accountId !== "string" || accountId.trim().length === 0) {
    return null;
  }
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const { amountCents, direction } = body as Record<string, unknown>;
  if (
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
 * Apply a ledger adjustment to the named account and return its new balance, or
 * null when the account is not one this service manages.
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
  return { accountId: adjustment.accountId, balanceCents };
}
