import { Router } from "express";
import { postQuote, postBulkQuote } from "../controllers/pricingController";

export const pricingRouter = Router();

pricingRouter.post("/quote", postQuote);
pricingRouter.post("/quote/bulk", postBulkQuote);
