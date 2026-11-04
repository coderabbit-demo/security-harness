import { Router } from "express";
import { postResetRequest, postResetConfirm } from "../controllers/passwordResetController";

export const passwordResetRouter = Router();

passwordResetRouter.post("/", postResetRequest);
passwordResetRouter.post("/confirm", postResetConfirm);
