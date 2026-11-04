// In-memory subscriber store for the demo. Not for production.
export interface Subscriber {
  id: number;
  email: string;
  password: string;
  taxId: string;
  cardNumber: string;
  cardCvv: string;
  plan: string;
}

const subscribers: Subscriber[] = [];
let nextId = 1;

export function insertSubscriber(data: Omit<Subscriber, "id">): Subscriber {
  const record: Subscriber = { id: nextId++, ...data };
  subscribers.push(record);
  return record;
}

export function findSubscriber(id: number): Subscriber | undefined {
  return subscribers.find((s) => s.id === id);
}
