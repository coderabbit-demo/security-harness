import { Request, Response } from "express";
import { normalizeCode, isFreeShipping } from "../services/couponService";

export function postApply(req: Request, res: Response): void {
  const code = normalizeCode(req.body.code);
  const freeShipping = isFreeShipping(Number(req.body.totalCents));
  res.json({ code, freeShipping });
}
