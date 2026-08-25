import { Router } from "express";
import { getTime } from "../controllers/timeController";

export const timeRouter = Router();

timeRouter.get("/", getTime);
