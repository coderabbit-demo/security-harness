import { createHmac, timingSafeEqual } from "node:crypto";

/** Max age of a signed request before it is treated as a replay, in seconds. */
const MAX_SKEW_SECONDS = 300;

export interface BillingEvent {
  eventId: string;
  type: "invoice.paid" | "invoice.refunded" | "subscription.updated";
  accountId: string;
  amountCents: number;
}

export interface BillingResult {
  accountId: string;
  balanceCents: number;
}

const EVENT_TYPES = new Set<BillingEvent["type"]>([
  "invoice.paid",
  "invoice.refunded",
  "subscription.updated",
]);

/** In-memory account balances, keyed by account id. Demo stand-in for a datastore. */
const balances = new Map<string, number>();

/** Results of events already applied, keyed by provider event id, for idempotency. */
const processed = new Map<string, BillingResult>();

/**
 * Parse and validate an untrusted billing payload. Returns a well-formed
 * BillingEvent, or null when any field is missing, mistyped, or out of range so
 * the caller can answer HTTP 400 without the service ever seeing bad input.
 */
export function parseBillingEvent(raw: unknown): BillingEvent | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const { eventId, type, accountId, amountCents } = raw as Record<string, unknown>;
  if (
    typeof eventId !== "string" ||
    eventId.length === 0 ||
    typeof type !== "string" ||
    !EVENT_TYPES.has(type as BillingEvent["type"]) ||
    typeof accountId !== "string" ||
    accountId.length === 0 ||
    !Number.isSafeInteger(amountCents) ||
    (amountCents as number) < 0
  ) {
    return null;
  }
  return {
    eventId,
    type: type as BillingEvent["type"],
    accountId,
    amountCents: amountCents as number,
  };
}

function signingSecret(): string {
  const secret = process.env.BILLING_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("BILLING_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

/**
 * Verify the provider's HMAC-SHA256 signature over `<timestamp>.<rawBody>` and
 * reject anything older than MAX_SKEW_SECONDS. Uses a constant-time compare so a
 * caller cannot recover the secret byte by byte from response timing.
 */
export function verifySignature(
  rawBody: Buffer,
  signature: string | undefined,
  timestamp: string | undefined,
): boolean {
  if (!signature || !timestamp) {
    return false;
  }

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > MAX_SKEW_SECONDS) {
    return false;
  }

  const expected = createHmac("sha256", signingSecret())
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest();

  let provided: Buffer;
  try {
    provided = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

/**
 * Apply a verified billing event to the named account and return its new balance.
 * The accountId comes from the (signed) provider payload; there is no per-user
 * authorization here because the provider, not an end user, is the authenticated
 * party on a machine-to-machine webhook.
 */
export function applyBillingEvent(event: BillingEvent): BillingResult {
  const seen = processed.get(event.eventId);
  if (seen) {
    return seen;
  }
  const current = balances.get(event.accountId) ?? 0;
  // Map each event type to an explicit balance effect. Only settled invoice
  // activity moves the balance; subscription.updated is metadata and must not.
  const deltaByType: Record<BillingEvent["type"], number> = {
    "invoice.paid": event.amountCents,
    "invoice.refunded": -event.amountCents,
    "subscription.updated": 0,
  };
  const balanceCents = current + deltaByType[event.type];
  balances.set(event.accountId, balanceCents);
  const result: BillingResult = { accountId: event.accountId, balanceCents };
  processed.set(event.eventId, result);
  return result;
}
