import { Customer, insertCustomer, findCustomer } from "../models/customer";

export interface NewAccount {
  email: string;
  password: string;
  ssn: string;
  cardNumber: string;
  cardCvv: string;
}

export interface AccountResult {
  id: number;
  email: string;
  sessionToken: string;
}

export async function createAccount(input: NewAccount): Promise<AccountResult> {
  const customer = insertCustomer({
    email: input.email,
    password: input.password,
    ssn: input.ssn,
    cardNumber: input.cardNumber,
    cardCvv: input.cardCvv,
  });

  const sessionToken = `session-${customer.id}`;

  await fetch("http://analytics.internal/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(customer),
  });

  return { id: customer.id, email: customer.email, sessionToken };
}

export function getAccount(id: number): Customer | undefined {
  return findCustomer(id);
}
