import type { User } from "../models/user.model.js";
import { all, get, run } from "../db/dbClient.js";
import { sqlString } from "../db/sql.js";

export const usersRepository = {
  getAll(): Promise<User[]> {
    return all<User>(`
      SELECT id, fullName, email, role, createdAt
      FROM Users
      ORDER BY createdAt DESC;
    `);
  },

  getById(id: string): Promise<User | null> {
    return get<User>(`
      SELECT id, fullName, email, role, createdAt
      FROM Users
      WHERE id = ${sqlString(id)};
    `).then((row) => row ?? null);
  },

  getByEmail(email: string): Promise<User | null> {
    return get<User>(`
      SELECT id, fullName, email, role, createdAt
      FROM Users
      WHERE lower(email) = lower(${sqlString(email)});
    `).then((row) => row ?? null);
  },

  async add(user: User): Promise<User> {
    await run(`
      INSERT INTO Users (id, fullName, email, role, createdAt)
      VALUES (
        ${sqlString(user.id)},
        ${sqlString(user.fullName)},
        ${sqlString(user.email)},
        ${sqlString(user.role)},
        ${sqlString(user.createdAt)}
      );
    `);
    return user;
  },

  async update(id: string, user: User): Promise<User | null> {
    const result = await run(`
      UPDATE Users
      SET fullName = ${sqlString(user.fullName)},
          email = ${sqlString(user.email)},
          role = ${sqlString(user.role)}
      WHERE id = ${sqlString(id)};
    `);
    return result.changes === 0 ? null : user;
  },

  async delete(id: string): Promise<boolean> {
    const result = await run(`
      DELETE FROM Users
      WHERE id = ${sqlString(id)};
    `);
    return result.changes > 0;
  },
};
