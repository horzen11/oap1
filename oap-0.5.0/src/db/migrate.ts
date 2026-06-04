import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { all, run } from "./dbClient.js";

type MigrationRow = { filename: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = path.resolve(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  const appliedRows = await all<MigrationRow>("SELECT filename FROM schema_migrations;");
  const applied = new Set(appliedRows.map((row) => row.filename));

  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8").trim();
    if (!sql) continue;

    await run(sql);
    await run(
      `
      INSERT INTO schema_migrations (filename, appliedAt)
      VALUES (?, ?);
    `,
      [file, new Date().toISOString()],
    );
    console.log(`Migration applied: ${file}`);
  }

  console.log("DB migrations completed");
}
