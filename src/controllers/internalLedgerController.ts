import { Request, Response } from "express";
import { parseAdjustment, applyAdjustment } from "../services/ledgerService";

/**
 * POST /internal/ledger — apply a ledger adjustment to an account.
 *
 * This is an internal, east-west endpoint. Caller identity is established by the
 * service mesh (mutual TLS); the service is not exposed at the public edge, so
 * there is no in-code authentication or per-caller authorization here. The
 * adjustment is applied to the account named in the request body.
 */
export function postLedgerAdjustment(req: Request, res: Response): void {
  const adjustment = parseAdjustment(req.body);
  if (!adjustment) {
    res.status(400).json({ error: "invalid ledger adjustment payload" });
    return;
  }

  res.json(applyAdjustment(adjustment));
}
