import { Router } from "express";
import { postBooking, listAll } from "../controllers/bookingController";

export const bookingsRouter = Router();

bookingsRouter.post("/", postBooking);
bookingsRouter.get("/", listAll);
