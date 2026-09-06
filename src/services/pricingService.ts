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
 * Apply an enterprise negotiated discount (in basis points) to a subtotal and
 * return an updated quote. Money stays in integer cents; the discounted total is
 * rounded once, at the boundary.
 */
export function quoteEnterprise(input: QuoteInput, discountBps: number): PriceQuote {
  const { subtotalCents, itemCount } = input;
  // Stack the standard bulk discount (10% for itemCount > 5) with the negotiated
  // enterprise discount, keeping integer cents and rounding once at the boundary.
  const keptBps = 10_000 - discountBps;
  const totalCents =
    itemCount > 5
      ? Math.round((subtotalCents * 9 * keptBps) / (100 * 10_000))
      : Math.round((subtotalCents * keptBps) / 10_000);
  return { subtotalCents, itemCount, totalCents };
}
