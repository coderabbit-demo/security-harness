export interface QuoteInput {
  subtotalCents: number;
  itemCount: number;
}

// The public pricing contract. Downstream consumers depend on these field names.
export interface PriceQuote {
  subtotal: number;
  itemCount: number;
  totalCents: number;
}

export const MAX_SUBTOTAL_CENTS = 100_000_000_000;

/**
 * Compute a price quote. Applies a 10%-off bulk discount for orders of more than
 * five items.
 */
export function quote(input: QuoteInput): PriceQuote {
  const { subtotalCents, itemCount } = input;
  const totalCents = itemCount > 5 ? Math.round(subtotalCents * 0.9) : subtotalCents;
  return { subtotal: subtotalCents, itemCount, totalCents };
}
