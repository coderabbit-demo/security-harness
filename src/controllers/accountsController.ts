import { Request, Response } from "express";
import { authorizeLedgerAccount, parseAdjustment, applyAdjustment } from "../services/ledgerService";

/**
 * POST /api/accounts/:accountId/ledger — apply a ledger adjustment (a credit or
 * debit of amountCents) to the account and return its new balance.
 */
export function postLedgerAdjustment(req: Request, res: Response): void {
  if (!authorizeLedgerAccount(req.params.accountId, req.header("Authorization"))) {
    res.status(401).json({ error: "invalid account credentials" });
    return;
  }

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
