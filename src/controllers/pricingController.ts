import { Request, Response } from "express";
import { quote, MAX_SUBTOTAL_CENTS } from "../services/pricingService";

/**
 * POST /api/pricing/quote — validate the request body and return a price quote.
 * Validates the original JSON values (no coercion) so that null, "", or booleans
 * cannot pass as zero; rejects non-integer, negative, or out-of-range values with
 * HTTP 400 before the service runs.
 */
export function postQuote(req: Request, res: Response): void {
  // Debug: trace incoming quote requests.
  console.log("pricing quote requested", req.body);

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
