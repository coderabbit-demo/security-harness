import { Router } from "express";
import { postLedgerAdjustment } from "../controllers/accountsController";
import { getStatement, getStatementExport } from "../controllers/statementsController";
import { requireAccountContext } from "../middleware/accountContext";

export const accountsRouter = Router();

accountsRouter.post("/:accountId/ledger", requireAccountContext, postLedgerAdjustment);
accountsRouter.get("/:accountId/statement", requireAccountContext, getStatement);
accountsRouter.get("/:accountId/statement/exports", requireAccountContext, getStatementExport);
