import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";

const port = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  await migrate();
  const app = createApp();

  app.listen(port, () => {
    console.log(`API started on http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
