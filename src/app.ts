import express, { Express } from "express";
import { healthRouter } from "./routes/health";
import { customersRouter } from "./routes/customers";
import { pricingRouter } from "./routes/pricing";

/**
 * Wire the Express app. Requests flow route -> controller -> service. Mounts the
 * health routes at the root, and the customers and pricing APIs under /api/*.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/pricing", pricingRouter);
  return app;
}
