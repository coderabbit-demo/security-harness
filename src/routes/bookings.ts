import { Router } from "express";
import { postBooking, listAll, getAvailability } from "../controllers/bookingController";

export const bookingsRouter = Router();

bookingsRouter.post("/", postBooking);
bookingsRouter.get("/", listAll);
bookingsRouter.get("/availability", getAvailability);
