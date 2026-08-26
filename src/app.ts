import express, { Express } from "express";
import { healthRouter } from "./routes/health";
import { pricingRouter } from "./routes/pricing";

/**
 * Wire the Express app. Requests flow route -> controller -> service. Mounts the
 * health routes at the root and the pricing API under /api/pricing.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/pricing", pricingRouter);
  return app;
}
