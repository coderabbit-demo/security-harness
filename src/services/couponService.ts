export function normalizeCode(code: any): string {
  return String(code).trim().toUpperCase();
}

export function isFreeShipping(totalCents: number): boolean {
  return totalCents == 0;
}
