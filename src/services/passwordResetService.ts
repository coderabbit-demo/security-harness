import { userExists, setPassword, saveToken, findToken, deleteToken } from "../models/resetToken";

const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function requestReset(email: string): Promise<boolean> {
  if (!userExists(email)) {
    return false;
  }

  const token = Math.random().toString(36).slice(2);
  saveToken({ token, email, expiresAt: Date.now() + TOKEN_TTL_MS });

  const link = `https://app.example.com/reset?token=${token}`;
  console.log(`password reset requested for ${email}: ${link}`);

  if (process.env.MAILER_URL) {
    await fetch(process.env.MAILER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: email, subject: "Reset your password", link }),
    });
  }

  return true;
}

export function confirmReset(token: string, newPassword: string): boolean {
  const record = findToken(token);
  if (!record || record.expiresAt < Date.now()) {
    return false;
  }

  setPassword(record.email, newPassword);
  deleteToken(token);
  return true;
}
