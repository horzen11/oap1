import type { User } from "../models/user.model.js";
import { all, get, run } from "../db/dbClient.js";

export const usersRepository = {
  getAll(): Promise<User[]> {
    return all<User>(`
      SELECT id, fullName, email, role, createdAt
      FROM Users
      ORDER BY createdAt DESC;
    `);
  },

  getById(id: string): Promise<User | null> {
    return get<User>(
      `
      SELECT id, fullName, email, role, createdAt
      FROM Users
      WHERE id = ?;
    `,
      [id],
    ).then((row) => row ?? null);
  },

  getByEmail(email: string): Promise<User | null> {
    return get<User>(
      `
      SELECT id, fullName, email, role, createdAt
      FROM Users
      WHERE lower(email) = lower(?);
    `,
      [email],
    ).then((row) => row ?? null);
  },

  async add(user: User): Promise<User> {
    await run(
      `
      INSERT INTO Users (id, fullName, email, role, createdAt)
      VALUES (?, ?, ?, ?, ?);
    `,
      [user.id, user.fullName, user.email, user.role, user.createdAt],
    );
    return user;
  },

  async update(id: string, user: User): Promise<User | null> {
    const result = await run(
      `
      UPDATE Users
      SET fullName = ?,
          email = ?,
          role = ?
      WHERE id = ?;
    `,
      [user.fullName, user.email, user.role, id],
    );
    return result.changes === 0 ? null : user;
  },

  async delete(id: string): Promise<boolean> {
    const result = await run(
      `
      DELETE FROM Users
      WHERE id = ?;
    `,
      [id],
    );
    return result.changes > 0;
  },
};
