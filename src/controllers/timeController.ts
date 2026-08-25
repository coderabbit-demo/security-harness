import { Request, Response } from "express";
import { currentTime } from "../services/timeService";

export function getTime(_req: Request, res: Response): void {
  res.json(currentTime());
}
