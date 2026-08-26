import { Request, Response } from "express";
import { createBooking, getBookings } from "../services/bookingService";

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
