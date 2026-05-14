import { Router } from "express";
import { requestsController } from "../controllers/requests.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const requestRoutes = Router();

requestRoutes.get("/", asyncHandler(requestsController.getAll));
requestRoutes.get("/:id", asyncHandler(requestsController.getById));
requestRoutes.post("/", asyncHandler(requestsController.create));
requestRoutes.put("/:id", asyncHandler(requestsController.update));
requestRoutes.patch("/:id", asyncHandler(requestsController.patch));
requestRoutes.delete("/:id", asyncHandler(requestsController.delete));
