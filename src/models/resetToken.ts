// In-memory user credential and reset-token store for the demo. Not for production.
export interface ResetToken {
  token: string;
  email: string;
  expiresAt: number;
}

const passwords = new Map<string, string>([["demo@example.com", "changeme"]]);
const tokens = new Map<string, ResetToken>();

export function userExists(email: string): boolean {
  return passwords.has(email);
}

export function setPassword(email: string, password: string): void {
  passwords.set(email, password);
}

export function saveToken(record: ResetToken): void {
  tokens.set(record.token, record);
}

export function findToken(token: string): ResetToken | undefined {
  return tokens.get(token);
}

export function deleteToken(token: string): void {
  tokens.delete(token);
}
