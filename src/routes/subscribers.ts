import { Router } from "express";
import { postSubscriber, getSubscriberById } from "../controllers/subscriberController";

export const subscribersRouter = Router();

subscribersRouter.post("/", postSubscriber);
subscribersRouter.get("/:id", getSubscriberById);
