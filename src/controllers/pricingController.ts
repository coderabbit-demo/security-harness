import { Request, Response } from "express";
import { applyBulkDiscount } from "../services/pricingService";

export function postQuote(req: Request, res: Response): void {
  const total = applyBulkDiscount({
    subtotalCents: Number(req.body.subtotalCents),
    itemCount: Number(req.body.itemCount),
  });
  res.json({ totalCents: total });
}
