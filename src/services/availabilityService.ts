import { listBookings } from "../models/booking";

export function isAvailable(date: string): boolean {
  return !listBookings().some((b) => b.status === "confirmed" && b.date === date);
}
