import cors, { type CorsOptions } from "cors";
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

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS: origin is not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // ЛР4: стабільна версійність API. Старі /api/... маршрути залишено для сумісності з ЛР3.
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/requests", requestRoutes);
  app.use("/api/v1/request-comments", requestCommentRoutes);

  app.use("/api/users", userRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/request-comments", requestCommentRoutes);

  app.use(express.static(path.resolve(__dirname, "../public")));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
