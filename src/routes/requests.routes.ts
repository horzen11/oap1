import { Router } from "express";
import { requestsController } from "../controllers/requests.controller.js";
import { demoAuth } from "../middleware/demo-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const requestRoutes = Router();

requestRoutes.get("/with-users", asyncHandler(requestsController.getWithUsers));
requestRoutes.get("/stats/by-status", asyncHandler(requestsController.getStatsByStatus));
requestRoutes.get("/stats/full", asyncHandler(requestsController.getFullStats));
requestRoutes.get("/latest-by-status", asyncHandler(requestsController.getLatestByStatus));

requestRoutes.use(asyncHandler(demoAuth));
requestRoutes.get("/search-safe", asyncHandler(requestsController.searchSafe));
requestRoutes.get("/", asyncHandler(requestsController.getAll));
requestRoutes.get("/:id", asyncHandler(requestsController.getById));
requestRoutes.post("/", asyncHandler(requestsController.create));
requestRoutes.put("/:id", asyncHandler(requestsController.update));
requestRoutes.patch("/:id", asyncHandler(requestsController.patch));
requestRoutes.delete("/:id", asyncHandler(requestsController.delete));
