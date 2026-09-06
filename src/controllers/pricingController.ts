import { Request, Response } from "express";
import { quote, quoteEnterprise, MAX_SUBTOTAL_CENTS } from "../services/pricingService";

// Technical domain for a basis-points rate: 0%..100% expressed in bps.
const MAX_BPS = 10_000;

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
 * POST /api/pricing/quote/enterprise — return a quote with an enterprise
 * negotiated discount (in basis points). Validates the request shape and bounds
 * the discount to the technical basis-points domain before the service runs.
 */
export function postEnterpriseQuote(req: Request, res: Response): void {
  const { subtotalCents, itemCount, discountBps } = req.body ?? {};

  if (
    !Number.isSafeInteger(subtotalCents) ||
    subtotalCents < 0 ||
    subtotalCents > MAX_SUBTOTAL_CENTS ||
    !Number.isSafeInteger(itemCount) ||
    itemCount < 0 ||
    !Number.isSafeInteger(discountBps) ||
    discountBps < 0 ||
    discountBps > MAX_BPS
  ) {
    res.status(400).json({
      error: "subtotalCents, itemCount, and discountBps must be integers within range",
    });
    return;
  }

  res.json(quoteEnterprise({ subtotalCents, itemCount }, discountBps));
}
