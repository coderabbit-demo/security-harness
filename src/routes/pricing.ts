import { Router } from "express";
import { postQuote } from "../controllers/pricingController";

export const pricingRouter = Router();

pricingRouter.post("/quote", postQuote);
