export interface Customer {
  id: number;
  email: string;
}

const store: Customer[] = [
  { id: 1, email: "ada@example.com" },
  { id: 2, email: "grace@example.com" },
];

export function findCustomer(id: number): Customer | undefined {
  return store.find((c) => c.id === id);
}
