import type { EquipmentRequest } from "../models/request.model.js";
import { all, get, run } from "../db/dbClient.js";

export type RequestWithUserRow = EquipmentRequest & {
  userEmail: string;
  userRole: string;
};

export type RequestStatusStat = {
  status: string;
  total: number;
};

export const requestsRepository = {
  getAll(): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      ORDER BY r.createdAt DESC;
    `);
  },

  getById(id: string): Promise<EquipmentRequest | null> {
    return get<EquipmentRequest>(
      `
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.id = ?;
    `,
      [id],
    ).then((row) => row ?? null);
  },

  getByIdForUser(id: string, ownerUserId: string): Promise<EquipmentRequest | null> {
    return get<EquipmentRequest>(
      `
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.id = ? AND r.userId = ?;
    `,
      [id, ownerUserId],
    ).then((row) => row ?? null);
  },

  searchSafe(q: string): Promise<EquipmentRequest[]> {
    const like = `%${q}%`;
    return all<EquipmentRequest>(
      `
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.itemCode LIKE ?
         OR r.comment LIKE ?
         OR u.fullName LIKE ?
      ORDER BY r.createdAt DESC;
    `,
      [like, like, like],
    );
  },

  getWithUsers(status?: string): Promise<RequestWithUserRow[]> {
    const params = status ? [status] : [];
    const where = status ? "WHERE r.status = ?" : "";
    return all<RequestWithUserRow>(
      `
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName, u.email AS userEmail, u.role AS userRole,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      ${where}
      ORDER BY r.createdAt DESC;
    `,
      params,
    );
  },

  getLatestByStatus(status: string, limit: number): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(
      `
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.status = ?
      ORDER BY r.createdAt DESC
      LIMIT ?;
    `,
      [status, limit],
    );
  },

  getStatsByStatus(): Promise<RequestStatusStat[]> {
    return all<RequestStatusStat>(`
      SELECT status, COUNT(*) AS total
      FROM Requests
      GROUP BY status
      ORDER BY total DESC;
    `);
  },

  getFullStats(status?: string) {
    const params = status ? [status] : [];
    const where = status ? "WHERE r.status = ?" : "";

    return all<{
      requestId: string;
      itemCode: string;
      status: string;
      userId: string;
      userName: string;
      userEmail: string;
      userRole: string;
      commentsCount: number;
    }>(
      `
      SELECT
        r.id AS requestId,
        r.itemCode,
        r.status,
        r.userId,
        u.fullName AS userName,
        u.email AS userEmail,
        u.role AS userRole,
        COUNT(c.id) AS commentsCount
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      LEFT JOIN RequestComments c ON c.requestId = r.id
      ${where}
      GROUP BY r.id, r.itemCode, r.status, r.userId, u.fullName, u.email, u.role
      ORDER BY commentsCount DESC;
    `,
      params,
    );
  },

  async add(request: EquipmentRequest): Promise<EquipmentRequest> {
    await run(
      `
      INSERT INTO Requests (id, itemCode, userId, dateFrom, dateTo, comment, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
      [
        request.id,
        request.itemCode,
        request.userId,
        request.dateFrom,
        request.dateTo,
        request.comment,
        request.status,
        request.createdAt,
        request.updatedAt,
      ],
    );
    return (await this.getById(request.id)) ?? request;
  },

  async update(id: string, request: EquipmentRequest): Promise<EquipmentRequest | null> {
    const result = await run(
      `
      UPDATE Requests
      SET itemCode = ?,
          userId = ?,
          dateFrom = ?,
          dateTo = ?,
          comment = ?,
          status = ?,
          updatedAt = ?
      WHERE id = ?;
    `,
      [
        request.itemCode,
        request.userId,
        request.dateFrom,
        request.dateTo,
        request.comment,
        request.status,
        request.updatedAt,
        id,
      ],
    );
    return result.changes === 0 ? null : await this.getById(id);
  },

  async updateForUser(id: string, request: EquipmentRequest, ownerUserId: string): Promise<EquipmentRequest | null> {
    const result = await run(
      `
      UPDATE Requests
      SET itemCode = ?,
          userId = ?,
          dateFrom = ?,
          dateTo = ?,
          comment = ?,
          status = ?,
          updatedAt = ?
      WHERE id = ? AND userId = ?;
    `,
      [
        request.itemCode,
        request.userId,
        request.dateFrom,
        request.dateTo,
        request.comment,
        request.status,
        request.updatedAt,
        id,
        ownerUserId,
      ],
    );
    return result.changes === 0 ? null : await this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    const result = await run(
      `
      DELETE FROM Requests
      WHERE id = ?;
    `,
      [id],
    );
    return result.changes > 0;
  },

  async deleteForUser(id: string, ownerUserId: string): Promise<boolean> {
    const result = await run(
      `
      DELETE FROM Requests
      WHERE id = ? AND userId = ?;
    `,
      [id, ownerUserId],
    );
    return result.changes > 0;
  },
};
