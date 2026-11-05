import { Router } from "express";
import { postLedgerAdjustment } from "../controllers/accountsController";
import { requireAccountContext } from "../middleware/accountContext";

export const accountsRouter = Router();

accountsRouter.post("/:accountId/ledger", requireAccountContext, postLedgerAdjustment);
