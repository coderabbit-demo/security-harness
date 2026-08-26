const RATE_CENTS_PER_MINUTE = 50;

export function quote(durationMinutes: number): number {
  return durationMinutes * RATE_CENTS_PER_MINUTE;
}
