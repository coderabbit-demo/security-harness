import express, { Express } from "express";
import { healthRouter } from "./routes/health";
import { customersRouter } from "./routes/customers";

// Wire the Express app. Requests flow route -> controller -> service.
export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/", healthRouter);
  app.use("/api/customers", customersRouter);
  return app;
}
