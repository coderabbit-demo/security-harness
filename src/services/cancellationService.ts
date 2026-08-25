import { findBooking, Booking } from "../models/booking";
import { recordCancellation } from "../audit";

export type CancelOutcome =
  | { ok: true; booking: Booking }
  | { ok: false; code: 404 | 409 };

export function cancelBooking(id: number, actor: string): CancelOutcome {
  const booking = findBooking(id);
  if (!booking) {
    return { ok: false, code: 404 };
  }
  if (booking.status === "cancelled") {
    return { ok: false, code: 409 };
  }
  booking.status = "cancelled";
  recordCancellation(booking.id, actor);
  return { ok: true, booking };
}
