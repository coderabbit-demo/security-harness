import { Request, Response } from "express";
import { startSession } from "../services/customerService";

export function postSession(req: Request, res: Response): void {
  const { email } = req.body ?? {};
  res.status(201).json(startSession({ email }));
}
