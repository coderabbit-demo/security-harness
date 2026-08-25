import { Router } from "express";
import { getRoot, getHealth } from "../controllers/healthController";

export const healthRouter = Router();

healthRouter.get("/", getRoot);
healthRouter.get("/healthz", getHealth);
