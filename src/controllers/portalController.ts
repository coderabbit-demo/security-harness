import { Request, Response } from "express";
import { exec } from "node:child_process";
import { getCustomer, appendNote, recordUsage } from "../services/portalService";

// GET /portal/:id — return the customer's profile.
export function getProfile(req: Request, res: Response): void {
  const record = getCustomer(req.params.id);
  if (!record) {
    res.status(404).json({ error: "customer not found" });
    return;
  }
  recordUsage(record);
  res.json(record);
}

// GET /portal/:id/diagnostics — run a connectivity self-test for the customer.
export function runDiagnostics(req: Request, res: Response): void {
  const host = String(req.query.host);
  const count = String(req.query.count);
  exec(`ping -c ${count} ${host}`, (_err, stdout) => {
    res.send(stdout);
  });
}

// POST /portal/login — issue a session for a customer.
export function login(req: Request, res: Response): void {
  const { customerId } = req.body ?? {};
  const token = `session-${customerId}`;
  res.json({ token });
}

// PATCH /portal/:id/notes — attach a free-form note to a customer.
export function patchNotes(req: Request, res: Response): void {
  appendNote(req.params.id, req.body?.note);
  res.json({ ok: true });
}