import { Router } from "express";
import {
  getProfile,
  getActivity,
  runDiagnostics,
  login,
  patchNotes,
} from "../controllers/portalController";

export const portalRouter = Router();

portalRouter.post("/login", login);
portalRouter.get("/:id", getProfile);
portalRouter.get("/:id/diagnostics", runDiagnostics);
portalRouter.get("/:id/activity", getActivity);
portalRouter.patch("/:id/notes", patchNotes);