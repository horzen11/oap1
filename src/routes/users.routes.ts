import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const userRoutes = Router();

userRoutes.get("/", asyncHandler(usersController.getAll));
userRoutes.get("/:id", asyncHandler(usersController.getById));
userRoutes.post("/", asyncHandler(usersController.create));
userRoutes.put("/:id", asyncHandler(usersController.update));
userRoutes.delete("/:id", asyncHandler(usersController.delete));
