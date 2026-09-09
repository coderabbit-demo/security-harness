import express, { Express } from "express";
import { healthRouter } from "./routes/health";
import { pricingRouter } from "./routes/pricing";
import { webhooksRouter } from "./routes/webhooks/billing";

/**
 * Wire the Express app. Requests flow route -> controller -> service. Mounts the
 * health routes at the root, the pricing API under /api/pricing, and the billing
 * webhooks under /api/webhooks.
 */
export function createApp(): Express {
  const app = express();
  // Webhook routes verify an HMAC over the raw request body, so they must see the
  // unparsed stream. Mount them before the app-wide JSON body parser.
  app.use("/api/webhooks", webhooksRouter);
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/pricing", pricingRouter);
  return app;
}
