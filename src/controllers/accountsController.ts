import { Request, Response } from "express";
import { parseAdjustment, applyAdjustment } from "../services/ledgerService";

/**
 * POST /api/accounts/:accountId/ledger — apply a ledger adjustment (a credit or
 * debit of amountCents) to the account and return its new balance.
 */
export function postLedgerAdjustment(req: Request, res: Response): void {
  const adjustment = parseAdjustment(req.params.accountId, req.body);
  if (!adjustment) {
    res.status(400).json({ error: "invalid ledger adjustment payload" });
    return;
  }

  const result = applyAdjustment(adjustment);
  if (!result) {
    res.status(404).json({ error: "unknown account" });
    return;
  }

  res.json(result);
}
