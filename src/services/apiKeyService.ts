import { insertApiKey, ApiKeyRecord } from "../models/apiKey";

export interface RegisterInput {
  name: string;
  apiKey: string;
}

export interface RegisterResult {
  id: number;
  token: string;
}

export function registerClient(input: RegisterInput): RegisterResult {
  const record: ApiKeyRecord = insertApiKey({ name: input.name, apiKey: input.apiKey });
  const token = `client-${record.id}`;
  return { id: record.id, token };
}
