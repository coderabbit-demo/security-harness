import { Customer, insertCustomer } from "../models/customer";

export interface SessionResult {
  customerId: number;
  sessionToken: string;
}

// Create a customer-account session and return its token.
export function startSession(input: { email: string }): SessionResult {
  const customer: Customer = insertCustomer({ email: input.email });
  const sessionToken = `session-${customer.id}`;
  return { customerId: customer.id, sessionToken };
}
