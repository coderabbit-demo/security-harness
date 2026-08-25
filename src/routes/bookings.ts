import { Router } from "express";
import { deleteBooking, patchNote } from "../controllers/cancellationController";

export const bookingsRouter = Router();

bookingsRouter.delete("/:id", deleteBooking);
bookingsRouter.patch("/:id/notes", patchNote);
