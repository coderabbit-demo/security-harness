export interface Booking {
  id: number;
  customerEmail: string;
  date: string;
  durationMinutes: number;
  status: "confirmed" | "cancelled";
}

const bookings: Booking[] = [];
let nextId = 1;

export function insertBooking(data: Omit<Booking, "id" | "status">): Booking {
  const record: Booking = { id: nextId++, status: "confirmed", ...data };
  bookings.push(record);
  return record;
}

export function listBookings(): Booking[] {
  return bookings;
}

export function findBooking(id: number): Booking | undefined {
  return bookings.find((b) => b.id === id);
}
