import { NextFunction, Request, Response } from "express";

const MAX_ACCOUNT_ID_LENGTH = 64;
const INVALID_CHARACTERS = /[,\s]/;

/**
 * Require the caller's account context in the X-Account-Id header and confirm it
 * matches the :accountId route parameter before any controller or service runs.
 * On success the validated ID is stored in res.locals.accountId.
 */
export function requireAccountContext(req: Request, res: Response, next: NextFunction): void {
  const accountId = req.header("X-Account-Id");
  if (accountId === undefined || accountId.trim().length === 0) {
    res.status(401).json({ error: "missing account context" });
    return;
  }
  if (INVALID_CHARACTERS.test(accountId) || accountId.length > MAX_ACCOUNT_ID_LENGTH) {
    res.status(400).json({ error: "invalid account context" });
    return;
  }
  if (accountId !== req.params.accountId) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  res.locals.accountId = accountId;
  next();
}
