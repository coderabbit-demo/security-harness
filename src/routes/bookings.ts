import { Router } from "express";
import { postBooking, listAll, getAvailability, postQuote, getReport } from "../controllers/bookingController";

export const bookingsRouter = Router();

bookingsRouter.post("/", postBooking);
bookingsRouter.get("/", listAll);
bookingsRouter.get("/availability", getAvailability);
bookingsRouter.post("/quote", postQuote);
bookingsRouter.get("/report", getReport);
