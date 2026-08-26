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

// Bulk discount: 10% off for orders of MORE THAN 5 items. Money is integer cents;
// never a float or a floating-point multiplier. Round once, at the boundary, in cents.
export function quote(input: QuoteInput): PriceQuote {
  const { subtotalCents, itemCount } = input;
  const totalCents =
    itemCount > 5 ? Math.round((subtotalCents * 90) / 100) : subtotalCents;
  return { subtotalCents, itemCount, totalCents };
}
