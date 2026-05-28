import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api-error.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  const message = String(err instanceof Error ? err.message : err);

  if (message.includes("UNIQUE constraint failed")) {
    return res.status(409).json({
      error: {
        code: "UNIQUE_CONSTRAINT",
        message: "Unique constraint violation",
        details: null,
      },
    });
  }

  if (
    message.includes("NOT NULL constraint failed") ||
    message.includes("CHECK constraint failed") ||
    message.includes("FOREIGN KEY constraint failed")
  ) {
    return res.status(400).json({
      error: {
        code: "DB_CONSTRAINT_ERROR",
        message: "Invalid data",
        details: [{ message }],
      },
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
      details: null,
    },
  });
}
