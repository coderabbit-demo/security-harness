export interface TimeResult {
  iso: string;
  epochMs: number;
}

export function currentTime(): TimeResult {
  const now = new Date();
  return { iso: now.toISOString(), epochMs: now.getTime() };
}
