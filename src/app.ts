import express, { Express } from "express";
import { healthRouter } from "./routes/health";
import { pricingRouter } from "./routes/pricing";
import { customersRouter } from "./routes/customers";

/**
 * Wire the Express app. Requests flow route -> controller -> service. Mounts the
 * health routes at the root, the pricing API under /api/pricing, and the customer
 * session API under /api/customers.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/pricing", pricingRouter);
  app.use("/api/customers", customersRouter);
  return app;
}
