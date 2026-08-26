import { Request, Response } from "express";
import { createBooking, getBookings } from "../services/bookingService";
import { isAvailable } from "../services/availabilityService";

export function postBooking(req: Request, res: Response): void {
  const booking = createBooking({
    customerEmail: req.body.customerEmail,
    date: req.body.date,
    durationMinutes: Number(req.body.durationMinutes),
  });
  res.status(201).json(booking);
}

export function listAll(_req: Request, res: Response): void {
  res.json(getBookings());
}

export function getAvailability(req: Request, res: Response): void {
  const date = String(req.query.date ?? "");
  res.json({ date, available: isAvailable(date) });
}
