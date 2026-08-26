import { Router } from "express";
import { postApiKey, getApiKey } from "../controllers/apiKeyController";

export const apiKeysRouter = Router();

apiKeysRouter.post("/", postApiKey);
apiKeysRouter.get("/:id", getApiKey);
