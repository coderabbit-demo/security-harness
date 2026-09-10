import { Router } from "express";
import {
  getProfile,
  runDiagnostics,
  login,
  patchNotes,
} from "../controllers/portalController";

export const portalRouter = Router();

portalRouter.post("/login", login);
portalRouter.get("/:id", getProfile);
portalRouter.get("/:id/diagnostics", runDiagnostics);
portalRouter.patch("/:id/notes", patchNotes);