import { db } from "./db.js";

function logSql(sql: string, params: unknown[] = []): void {
  if (process.env.NODE_ENV !== "production") {
    const compactSql = sql.trim().replace(/\s+/g, " ");
    const suffix = params.length > 0 ? ` | params=${JSON.stringify(params)}` : "";
    console.log("[SQL]", compactSql + suffix);
  }
}

export function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  logSql(sql, params);
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

export function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  logSql(sql, params);
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T | undefined)));
  });
}

export type RunResult = {
  lastID: number;
  changes: number;
};

export function run(sql: string, params: unknown[] = []): Promise<RunResult> {
  logSql(sql, params);
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
