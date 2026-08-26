import { Router } from "express";
import { getCustomer } from "../controllers/customerController";

export const customersRouter = Router();

customersRouter.get("/:id", getCustomer);
