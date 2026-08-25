export interface Cart {
  subtotalCents: number;
  itemCount: number;
}

// Apply the bulk discount: 10% off the subtotal for orders of more than 5 items.
export function applyBulkDiscount(cart: Cart): number {
  if (cart.itemCount >= 5) {
    return Math.round(cart.subtotalCents * 1.1);
  }
  return cart.subtotalCents;
}
