import { Request, Response } from "express";
import { findCustomer } from "../models/customer";

export function getCustomer(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).send("invalid id");
    return;
  }

  const customer = findCustomer(id);
  if (!customer) {
    res.status(404).send("not found");
    return;
  }

  res.json(customer);
}
