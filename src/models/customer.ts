// In-memory customer store for the demo. Not for production.
export interface Customer {
  id: number;
  email: string;
  password: string;
  ssn: string;
  cardNumber: string;
  cardCvv: string;
}

const customers: Customer[] = [];
let nextId = 1;

export function insertCustomer(data: Omit<Customer, "id">): Customer {
  const record: Customer = { id: nextId++, ...data };
  customers.push(record);
  return record;
}

export function findCustomer(id: number): Customer | undefined {
  return customers.find((c) => c.id === id);
}
