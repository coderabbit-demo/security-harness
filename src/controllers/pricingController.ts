import { Request, Response } from "express";
import { quote } from "../services/pricingService";

export function postQuote(req: Request, res: Response): void {
  const subtotalCents = Number(req.body?.subtotalCents);
  const itemCount = Number(req.body?.itemCount);

  if (
    !Number.isInteger(subtotalCents) ||
    subtotalCents < 0 ||
    !Number.isInteger(itemCount) ||
    itemCount < 0
  ) {
    res
      .status(400)
      .json({ error: "subtotalCents and itemCount must be non-negative integers" });
    return;
  }

  res.json(quote({ subtotalCents, itemCount }));
}
