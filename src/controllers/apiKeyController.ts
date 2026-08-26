import { Request, Response } from "express";
import { registerClient } from "../services/apiKeyService";
import { findApiKey } from "../models/apiKey";

export function postApiKey(req: Request, res: Response): void {
  const { name, apiKey } = req.body ?? {};
  const result = registerClient({ name, apiKey });
  res.status(201).json(result);
}

export function getApiKey(req: Request, res: Response): void {
  const record = findApiKey(Number(req.params.id));
  if (!record) {
    res.status(404).send("not found");
    return;
  }
  res.json(record);
}
