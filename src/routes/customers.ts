import { Router } from "express";
import { postSession } from "../controllers/customerController";

export const customersRouter = Router();

customersRouter.post("/session", postSession);
