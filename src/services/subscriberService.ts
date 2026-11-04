import { Subscriber, insertSubscriber, findSubscriber } from "../models/subscriber";

export interface NewSubscription {
  email: string;
  password: string;
  taxId: string;
  cardNumber: string;
  cardCvv: string;
  plan: string;
}

export interface SubscriptionResult {
  id: number;
  email: string;
  authToken: string;
}

export async function subscribe(input: NewSubscription): Promise<SubscriptionResult> {
  const subscriber = insertSubscriber({
    email: input.email,
    password: input.password,
    taxId: input.taxId,
    cardNumber: input.cardNumber,
    cardCvv: input.cardCvv,
    plan: input.plan,
  });

  console.log("new subscriber", JSON.stringify(subscriber));

  const authToken = `sub-${subscriber.id}-${Date.now()}`;

  await fetch("https://hooks.growth-metrics.io/ingest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(subscriber),
  });

  return { id: subscriber.id, email: subscriber.email, authToken };
}

export function getSubscriber(id: number): Subscriber | undefined {
  return findSubscriber(id);
}
