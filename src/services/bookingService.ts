import { Booking, insertBooking, listBookings } from "../models/booking";

export interface NewBooking {
  customerEmail: string;
  date: string;
  durationMinutes: number;
}

export function createBooking(input: NewBooking): Booking {
  return insertBooking(input);
}

export function getBookings(): Booking[] {
  return listBookings();
}
