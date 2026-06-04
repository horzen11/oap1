import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";
import { usersRepository } from "../repositories/users.repository.js";

export type DemoUser = {
  id: string;
};

declare module "express-serve-static-core" {
  interface Request {
    currentUser?: DemoUser;
  }
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function demoAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("X-Demo-UserId");

  if (!userId) {
    return next(new ApiError(401, "UNAUTHORIZED", "X-Demo-UserId header is required"));
  }

  if (!uuidRegex.test(userId)) {
    return next(new ApiError(401, "UNAUTHORIZED", "X-Demo-UserId is invalid"));
  }

  const user = await usersRepository.getById(userId);

  if (!user) {
    return next(new ApiError(401, "UNAUTHORIZED", "Demo user not found"));
  }

  req.currentUser = { id: user.id };
  return next();
}

export function requireCurrentUser(req: Request): DemoUser {
  if (!req.currentUser) {
    throw new ApiError(401, "UNAUTHORIZED", "X-Demo-UserId header is required");
  }

  return req.currentUser;
}
