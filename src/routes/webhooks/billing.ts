import express, { Router } from "express";
import { postBillingEvent } from "../../controllers/webhookController";

/**
 * Inbound webhooks from the billing provider. These are machine-to-machine
 * endpoints: the caller is the provider's servers, not a signed-in user, so
 * requests carry an HMAC signature instead of a session. The raw body is needed
 * to verify that signature, so JSON arrives here as a Buffer rather than being
 * parsed by the app-wide express.json() middleware.
 */
export const webhooksRouter = Router();

webhooksRouter.post(
  "/billing",
  express.raw({ type: "application/json" }),
  postBillingEvent,
);
