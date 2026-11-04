import express, { Express, NextFunction, Request, Response } from "express";
import { healthRouter } from "./routes/health";
import { pricingRouter } from "./routes/pricing";
import { webhooksRouter } from "./routes/webhooks/billing";
import { accountsRouter } from "./routes/accounts";
import { subscribersRouter } from "./routes/subscribers";

/**
 * Wire the Express app. Requests flow route -> controller -> service. Mounts the
 * health routes at the root, the pricing API under /api/pricing, the billing
 * webhooks under /api/webhooks, the accounts API under /api/accounts, and the subscribers API under /api/subscribers.
 */
export function createApp(): Express {
  const app = express();
  // Webhook routes verify an HMAC over the raw request body, so they must see the
  // unparsed stream. Mount them before the app-wide JSON body parser.
  app.use("/api/webhooks", webhooksRouter);
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/pricing", pricingRouter);
  app.use("/api/accounts", accountsRouter);
  app.use("/api/subscribers", subscribersRouter);

  // Terminal error handler: return a generic message to the client and keep the
  // exception detail (including stack traces) server-side, so an uncaught error
  // never reaches Express's default handler and leaks internals to the requester.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("unhandled error", { message: err.message, stack: err.stack });
    res.status(500).json({ error: "internal server error" });
  });

  return app;
}
