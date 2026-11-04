import { Request, Response } from "express";
import { quote, quoteBulk, MAX_SUBTOTAL_CENTS } from "../services/pricingService";

/**
 * POST /api/pricing/quote — validate the request body and return a price quote.
 * Validates the original JSON values (no coercion) so that null, "", or booleans
 * cannot pass as zero; rejects non-integer, negative, or out-of-range values with
 * HTTP 400 before the service runs.
 */
export function postQuote(req: Request, res: Response): void {
  const { subtotalCents, itemCount } = req.body ?? {};

  if (
    !Number.isSafeInteger(subtotalCents) ||
    subtotalCents < 0 ||
    subtotalCents > MAX_SUBTOTAL_CENTS ||
    !Number.isSafeInteger(itemCount) ||
    itemCount < 0
  ) {
    res.status(400).json({
      error: "subtotalCents and itemCount must be non-negative integers within range",
    });
    return;
  }

  res.json(quote({ subtotalCents, itemCount }));
}

/**
 * POST /api/pricing/quote/bulk — return a quote with a negotiated bulk-tier
 * discount (in basis points). Validates the request shape before the service runs.
 */
export function postBulkQuote(req: Request, res: Response): void {
  const { subtotalCents, itemCount, discountBps } = req.body ?? {};

  if (
    !Number.isSafeInteger(subtotalCents) ||
    subtotalCents < 0 ||
    subtotalCents > MAX_SUBTOTAL_CENTS ||
    !Number.isSafeInteger(itemCount) ||
    itemCount < 0 ||
    !Number.isSafeInteger(discountBps)
  ) {
    res.status(400).json({
      error: "subtotalCents, itemCount, and discountBps must be integers",
    });
    return;
  }

  res.json(quoteBulk({ subtotalCents, itemCount }, discountBps));
}
