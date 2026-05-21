import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { requestCommentRoutes } from "./routes/request-comments.routes.js";
import { requestRoutes } from "./routes/requests.routes.js";
import { userRoutes } from "./routes/users.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use("/api/users", userRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/request-comments", requestCommentRoutes);

  app.use(express.static(path.resolve(__dirname, "../public")));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
