import type { RequestComment } from "../models/request-comment.model.js";
import { all, get, run } from "../db/dbClient.js";
import { sqlString } from "../db/sql.js";

export const requestCommentsRepository = {
  getAll(): Promise<RequestComment[]> {
    return all<RequestComment>(`
      SELECT c.id, c.requestId, c.userId, u.fullName AS userName,
             c.body, c.createdAt, c.updatedAt
      FROM RequestComments c
      JOIN Users u ON u.id = c.userId
      ORDER BY c.createdAt DESC;
    `);
  },

  getById(id: string): Promise<RequestComment | null> {
    return get<RequestComment>(`
      SELECT c.id, c.requestId, c.userId, u.fullName AS userName,
             c.body, c.createdAt, c.updatedAt
      FROM RequestComments c
      JOIN Users u ON u.id = c.userId
      WHERE c.id = ${sqlString(id)};
    `).then((row) => row ?? null);
  },

  getByRequestId(requestId: string): Promise<RequestComment[]> {
    return all<RequestComment>(`
      SELECT c.id, c.requestId, c.userId, u.fullName AS userName,
             c.body, c.createdAt, c.updatedAt
      FROM RequestComments c
      JOIN Users u ON u.id = c.userId
      WHERE c.requestId = ${sqlString(requestId)}
      ORDER BY c.createdAt DESC;
    `);
  },

  async add(comment: RequestComment): Promise<RequestComment> {
    await run(`
      INSERT INTO RequestComments (id, requestId, userId, body, createdAt, updatedAt)
      VALUES (
        ${sqlString(comment.id)},
        ${sqlString(comment.requestId)},
        ${sqlString(comment.userId)},
        ${sqlString(comment.body)},
        ${sqlString(comment.createdAt)},
        ${sqlString(comment.updatedAt)}
      );
    `);
    return (await this.getById(comment.id)) ?? comment;
  },

  async update(id: string, comment: RequestComment): Promise<RequestComment | null> {
    const result = await run(`
      UPDATE RequestComments
      SET requestId = ${sqlString(comment.requestId)},
          userId = ${sqlString(comment.userId)},
          body = ${sqlString(comment.body)},
          updatedAt = ${sqlString(comment.updatedAt)}
      WHERE id = ${sqlString(id)};
    `);
    return result.changes === 0 ? null : await this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    const result = await run(`
      DELETE FROM RequestComments
      WHERE id = ${sqlString(id)};
    `);
    return result.changes > 0;
  },
};
