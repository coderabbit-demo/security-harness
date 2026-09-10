import { Router } from "express";
import { postLedgerAdjustment } from "../controllers/accountsController";

export const accountsRouter = Router();

accountsRouter.post("/:accountId/ledger", postLedgerAdjustment);
