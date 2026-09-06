import { Router } from "express";
import { postQuote, postEnterpriseQuote } from "../controllers/pricingController";

export const pricingRouter = Router();

pricingRouter.post("/quote", postQuote);
pricingRouter.post("/quote/enterprise", postEnterpriseQuote);
