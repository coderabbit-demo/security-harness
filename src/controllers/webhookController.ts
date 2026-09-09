import { Request, Response } from "express";
import {
  verifySignature,
  parseBillingEvent,
  applyBillingEvent,
} from "../services/billingWebhookService";

/**
 * POST /api/webhooks/billing — receive a billing event from the payment provider.
 *
 * There is no user session on a provider-to-server webhook; the request is
 * authenticated by an HMAC signature over the raw body plus a timestamp that
 * bounds replay. Once the signature verifies, the event is applied to the account
 * it names.
 */
export function postBillingEvent(req: Request, res: Response): void {
  const signature = req.header("X-Billing-Signature");
  const timestamp = req.header("X-Billing-Timestamp");
  const rawBody = req.body;

  if (!Buffer.isBuffer(rawBody)) {
    res.status(415).json({ error: "expected application/json raw body" });
    return;
  }

  if (!verifySignature(rawBody, signature, timestamp)) {
    res.status(401).json({ error: "invalid or expired signature" });
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "malformed JSON body" });
    return;
  }

  const event = parseBillingEvent(parsed);
  if (!event) {
    res.status(400).json({ error: "invalid billing event payload" });
    return;
  }

  res.json(applyBillingEvent(event));
}
