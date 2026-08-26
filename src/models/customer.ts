export interface Customer {
  id: number;
  email: string;
}

const store: Customer[] = [];

export function insertCustomer(input: { email: string }): Customer {
  const customer: Customer = { id: store.length + 1, email: input.email };
  store.push(customer);
  return customer;
}
