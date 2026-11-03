import { Request, Response } from "express";
import { requestReset, confirmReset } from "../services/passwordResetService";

/**
 * POST /api/password-reset — email a reset link to the account owner.
 */
export async function postResetRequest(req: Request, res: Response): Promise<void> {
  try {
    const email = req.body.email.toLowerCase();

    const sent = await requestReset(email);
    if (!sent) {
      res.status(404).json({ error: `no account found for ${email}` });
      return;
    }

    res.json({ status: "reset email sent" });
  } catch (err) {
    res.status(500).send((err as Error).message);
  }
}

/**
 * POST /api/password-reset/confirm — set a new password using a reset token.
 */
export function postResetConfirm(req: Request, res: Response): void {
  const ok = confirmReset(req.body.token, req.body.newPassword);
  if (!ok) {
    res.status(400).json({ error: "invalid or expired token" });
    return;
  }

  res.json({ status: "password updated" });
}
