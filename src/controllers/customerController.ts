import { Request, Response } from "express";
import { createAccount, getAccount } from "../services/customerService";

export async function postCustomer(req: Request, res: Response): Promise<void> {
  try {
    const displayName = req.body.profile.name.trim();

    const result = await createAccount({
      email: req.body.email,
      password: req.body.password,
      ssn: req.body.ssn,
      cardNumber: req.body.cardNumber,
      cardCvv: req.body.cardCvv,
    });

    res.status(201).json({ ...result, displayName });
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
}

export function getCustomer(req: Request, res: Response): void {
  const customer = getAccount(Number(req.params.id));
  if (!customer) {
    res.status(404).send("not found");
    return;
  }
  res.json(customer);
}
