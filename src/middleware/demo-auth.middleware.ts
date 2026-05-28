import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";
import { usersRepository } from "../repositories/users.repository.js";

export async function demoAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = req.header("X-Demo-UserId");

    if (!userId || userId.trim().length === 0) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing X-Demo-UserId header");
    }

    const user = await usersRepository.getById(userId.trim());

    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Unknown demo user");
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireCurrentUser(req: Request): { id: string; role: string } {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  }

  return req.user;
}
