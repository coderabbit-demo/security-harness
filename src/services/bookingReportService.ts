import { listBookings } from "../models/booking";

export interface BookingReport {
  total: number;
  confirmed: number;
  cancelled: number;
  totalMinutes: number;
}

export function buildReport(): BookingReport {
  const all = listBookings();
  return {
    total: all.length,
    confirmed: all.filter((b) => b.status === "confirmed").length,
    cancelled: all.filter((b) => b.status === "cancelled").length,
    totalMinutes: all.reduce((sum, b) => sum + b.durationMinutes, 0),
  };
}
