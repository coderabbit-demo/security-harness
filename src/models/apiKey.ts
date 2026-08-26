export interface ApiKeyRecord {
  id: number;
  name: string;
  apiKey: string;
}

const store: ApiKeyRecord[] = [];

export function insertApiKey(input: { name: string; apiKey: string }): ApiKeyRecord {
  const record: ApiKeyRecord = { id: store.length + 1, name: input.name, apiKey: input.apiKey };
  store.push(record);
  return record;
}

export function findApiKey(id: number): ApiKeyRecord | undefined {
  return store.find((r) => r.id === id);
}
