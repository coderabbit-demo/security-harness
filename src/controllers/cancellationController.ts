import { Request, Response } from "express";
import { cancelBooking } from "../services/cancellationService";
import { findBooking } from "../models/booking";

export function deleteBooking(req: Request, res: Response): void {
  const token = req.header("x-session-token");
  if (!token) {
    res.status(401).send("missing session token");
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).send("invalid booking id");
    return;
  }

  const result = cancelBooking(id, token);
  if (!result.ok) {
    res.status(result.code).send(result.code === 404 ? "not found" : "already cancelled");
    return;
  }
  res.status(200).json(result.booking);
}

export function patchNote(req: Request, res: Response): void {
  const id = Number(req.params.id);
  const booking = findBooking(id);
  if (!booking) {
    res.status(404).send("not found");
    return;
  }
  booking.note = String(req.body.note ?? "");
  res.status(200).json(booking);
}
