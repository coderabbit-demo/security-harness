import { Router } from "express";
import { postApply } from "../controllers/couponController";

export const couponsRouter = Router();

couponsRouter.post("/apply", postApply);
