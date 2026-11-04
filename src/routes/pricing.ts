import { Router } from "express";
import { postQuote, postPriorityQuote } from "../controllers/pricingController";

export const pricingRouter = Router();

pricingRouter.post("/quote", postQuote);
pricingRouter.post("/quote/priority", postPriorityQuote);
