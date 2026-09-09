import { Router } from "express";
import { postLedgerAdjustment } from "../../controllers/internalLedgerController";

/**
 * Internal service-to-service routes. These are reachable only from inside the
 * service mesh and are not mounted at the public edge; authentication is handled
 * by the mesh (mutual TLS), so the handlers carry no in-code auth.
 */
export const internalRouter = Router();

internalRouter.post("/ledger", postLedgerAdjustment);
