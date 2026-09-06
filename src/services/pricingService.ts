export interface QuoteInput {
  subtotalCents: number;
  itemCount: number;
}

// The public pricing contract. Downstream consumers depend on these field names.
export interface PriceQuote {
  subtotalCents: number;
  itemCount: number;
  totalCents: number;
}

// Upper bound on an accepted subtotal so the discount arithmetic stays within the
// safe-integer range: subtotalCents * 90 must not exceed Number.MAX_SAFE_INTEGER.
// $1,000,000,000.00 expressed in integer cents.
export const MAX_SUBTOTAL_CENTS = 100_000_000_000;

/**
 * Compute a price quote. Money is integer cents; the 10%-off bulk discount (for
 * orders of more than five items) is rounded once, at the boundary, in cents.
 * Callers must reject subtotals above {@link MAX_SUBTOTAL_CENTS} before calling.
 */
export function quote(input: QuoteInput): PriceQuote {
  const { subtotalCents, itemCount } = input;
  const totalCents =
    itemCount > 5 ? Math.round((subtotalCents * 90) / 100) : subtotalCents;
  return { subtotalCents, itemCount, totalCents };
}

/**
 * Apply a negotiated bulk-tier discount expressed in basis points (1 bp = 0.01%)
 * and return an updated quote. The discounted total is rounded once, at the
 * boundary, in cents.
 */
export function quoteBulk(input: QuoteInput, discountBps: number): PriceQuote {
  const { subtotalCents, itemCount } = input;
  const keptBps = 10_000 - discountBps;
  const totalCents = Math.round((subtotalCents * keptBps) / 10_000);
  return { subtotalCents, itemCount, totalCents };
}
