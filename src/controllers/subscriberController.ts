import { Request, Response } from "express";
import { subscribe, getSubscriber } from "../services/subscriberService";

export async function postSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const planName = req.body.plan.name.toLowerCase();

    const result = await subscribe({
      email: req.body.email,
      password: req.body.password,
      taxId: req.body.taxId,
      cardNumber: req.body.cardNumber,
      cardCvv: req.body.cardCvv,
      plan: planName,
    });

    res.status(201).json({ ...result, plan: planName });
  } catch (err) {
    res.status(500).send((err as Error).stack);
  }
}

export function getSubscriberById(req: Request, res: Response): void {
  const subscriber = getSubscriber(Number(req.params.id));
  if (!subscriber) {
    res.status(404).send("not found");
    return;
  }
  res.json(subscriber);
}
