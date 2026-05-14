import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => void): RequestHandler {
  return (req, res, next) => {
    try {
      handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
