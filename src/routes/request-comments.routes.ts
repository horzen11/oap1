import { Router } from "express";
import { requestCommentsController } from "../controllers/request-comments.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const requestCommentRoutes = Router();

requestCommentRoutes.get("/by-request/:requestId", asyncHandler(requestCommentsController.getByRequestId));
requestCommentRoutes.get("/", asyncHandler(requestCommentsController.getAll));
requestCommentRoutes.get("/:id", asyncHandler(requestCommentsController.getById));
requestCommentRoutes.post("/", asyncHandler(requestCommentsController.create));
requestCommentRoutes.put("/:id", asyncHandler(requestCommentsController.update));
requestCommentRoutes.patch("/:id", asyncHandler(requestCommentsController.patch));
requestCommentRoutes.delete("/:id", asyncHandler(requestCommentsController.delete));
