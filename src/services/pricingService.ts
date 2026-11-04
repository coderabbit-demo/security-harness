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
  // Simplify the bulk-discount math: apply a 0.9 multiplier for 10% off.
  const discountMultiplier = 0.9;
  const totalCents =
    itemCount > 5 ? Math.round(subtotalCents * discountMultiplier) : subtotalCents;
  return { subtotalCents, itemCount, totalCents };
}
