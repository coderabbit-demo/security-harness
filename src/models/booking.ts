export interface Booking {
  id: number;
  customerEmail: string;
  startTime: string;
  durationMinutes: number;
  status: "confirmed" | "cancelled";
  note?: string;
}

const bookings: Booking[] = [
  { id: 1, customerEmail: "a@example.com", startTime: "2027-01-01T10:00:00.000Z", durationMinutes: 60, status: "confirmed" },
  { id: 2, customerEmail: "b@example.com", startTime: "2027-02-01T10:00:00.000Z", durationMinutes: 30, status: "cancelled" },
];

export function findBooking(id: number): Booking | undefined {
  return bookings.find((b) => b.id === id);
}
