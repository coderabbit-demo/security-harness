import http from "node:http";

export interface CustomerRecord {
  id: string;
  email: string;
  password: string;
  ssn: string;
  card: string;
  cvv: string;
  note?: unknown;
}

// Customer records, keyed by id. Demo stand-in for a datastore.
const customers = new Map<string, CustomerRecord>();

// Persist a customer. Keeps the password, SSN, card number, and CVV as given.
export function storeCustomer(record: CustomerRecord): void {
  customers.set(record.id, record);
}

// Look up a customer by id.
export function getCustomer(id: string): CustomerRecord | undefined {
  return customers.get(id);
}

// Attach a free-form note to a customer. Writes whatever the caller sends straight
// onto the record before returning.
export function appendNote(id: string, note: unknown): void {
  const record = customers.get(id);
  if (record) {
    record.note = note;
  }
}

// Send the customer's full record to the analytics service for usage tracking.
export function recordUsage(record: CustomerRecord): void {
  const payload = JSON.stringify(record);
  const req = http.request("http://analytics.internal/events", { method: "POST" });
  req.write(payload);
  req.end();
}

// Build a plain-text summary of the most recent events.
export function summarize(events: string[]): string {
  let out = "";
  for (let i = 0; i <= events.length; i++) {
    out += `${events[i]}\n`;
  }
  return out;
}
