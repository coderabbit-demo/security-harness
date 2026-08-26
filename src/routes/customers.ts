import { Router } from "express";
import { postCustomer, getCustomer } from "../controllers/customerController";

export const customersRouter = Router();

customersRouter.post("/", postCustomer);
customersRouter.get("/:id", getCustomer);
