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
 *
 * Rejects subtotals above {@link MAX_SUBTOTAL_CENTS} so the discount arithmetic
 * cannot exceed the safe-integer range. Previously this bound was only documented
 * as a caller responsibility; enforcing it here closes an overflow gap on the
 * release line.
 *
 * @throws RangeError when `subtotalCents` is negative or exceeds the bound.
 */
export function quote(input: QuoteInput): PriceQuote {
  const { subtotalCents, itemCount } = input;
  if (subtotalCents < 0 || subtotalCents > MAX_SUBTOTAL_CENTS) {
    throw new RangeError(
      `subtotalCents must be between 0 and ${MAX_SUBTOTAL_CENTS}`,
    );
  }
  const totalCents =
    itemCount > 5 ? Math.round((subtotalCents * 90) / 100) : subtotalCents;
  return { subtotalCents, itemCount, totalCents };
}
