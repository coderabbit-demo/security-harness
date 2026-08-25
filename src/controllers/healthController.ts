import { Request, Response } from "express";
import { getSystemStatus } from "../services/systemService";

export function getRoot(_req: Request, res: Response): void {
  res.send("Hello World");
}

export function getHealth(_req: Request, res: Response): void {
  res.json(getSystemStatus());
}
