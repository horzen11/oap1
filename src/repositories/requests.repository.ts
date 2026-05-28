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

const requestSelect = `
  SELECT r.id, r.itemCode, r.userId, u.fullName AS userName, r.ownerUserId,
         r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
  FROM Requests r
  JOIN Users u ON u.id = r.userId
`;

export const requestsRepository = {
  getAll(): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(`
      ${requestSelect}
      ORDER BY r.createdAt DESC;
    `);
  },

  getAllOwned(ownerUserId: string, search = "", status?: string): Promise<EquipmentRequest[]> {
    const params: unknown[] = [ownerUserId];
    const where = ["r.ownerUserId = ?"];

    if (search.trim()) {
      where.push("(r.itemCode LIKE ? OR r.comment LIKE ? OR u.fullName LIKE ?)");
      const like = `%${search.trim()}%`;
      params.push(like, like, like);
    }

    if (status) {
      where.push("r.status = ?");
      params.push(status);
    }

    return all<EquipmentRequest>(`
      ${requestSelect}
      WHERE ${where.join(" AND ")}
      ORDER BY r.createdAt DESC;
    `, params);
  },

  getById(id: string): Promise<EquipmentRequest | null> {
    return get<EquipmentRequest>(`
      ${requestSelect}
      WHERE r.id = ?;
    `, [id]).then((row) => row ?? null);
  },

  getByIdForOwner(id: string, ownerUserId: string): Promise<EquipmentRequest | null> {
    return get<EquipmentRequest>(`
      ${requestSelect}
      WHERE r.id = ? AND r.ownerUserId = ?;
    `, [id, ownerUserId]).then((row) => row ?? null);
  },

  searchSafe(q: string, ownerUserId: string): Promise<EquipmentRequest[]> {
    const like = `%${q}%`;
    return all<EquipmentRequest>(`
      ${requestSelect}
      WHERE r.ownerUserId = ?
        AND (r.itemCode LIKE ? OR r.comment LIKE ? OR u.fullName LIKE ?)
      ORDER BY r.createdAt DESC;
    `, [ownerUserId, like, like, like]);
  },

  getWithUsers(status?: string): Promise<RequestWithUserRow[]> {
    const where = status ? "WHERE r.status = ?" : "";
    const params = status ? [status] : [];

    return all<RequestWithUserRow>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName, u.email AS userEmail, u.role AS userRole,
             r.ownerUserId, r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      ${where}
      ORDER BY r.createdAt DESC;
    `, params);
  },

  getLatestByStatus(status: string, limit: number): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(`
      ${requestSelect}
      WHERE r.status = ?
      ORDER BY r.createdAt DESC
      LIMIT ?;
    `, [status, limit]);
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
    const where = status ? "WHERE r.status = ?" : "";
    const params = status ? [status] : [];

    return all<{
      requestId: string;
      itemCode: string;
      status: string;
      userId: string;
      userName: string;
      userEmail: string;
      userRole: string;
      commentsCount: number;
    }>(`
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
    `, params);
  },

  async add(request: EquipmentRequest): Promise<EquipmentRequest> {
    await run(`
      INSERT INTO Requests (id, itemCode, userId, ownerUserId, dateFrom, dateTo, comment, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      request.id,
      request.itemCode,
      request.userId,
      request.ownerUserId,
      request.dateFrom,
      request.dateTo,
      request.comment,
      request.status,
      request.createdAt,
      request.updatedAt,
    ]);

    return (await this.getById(request.id)) ?? request;
  },

  async update(id: string, ownerUserId: string, request: EquipmentRequest): Promise<EquipmentRequest | null> {
    const result = await run(`
      UPDATE Requests
      SET itemCode = ?,
          userId = ?,
          dateFrom = ?,
          dateTo = ?,
          comment = ?,
          status = ?,
          updatedAt = ?
      WHERE id = ? AND ownerUserId = ?;
    `, [
      request.itemCode,
      request.userId,
      request.dateFrom,
      request.dateTo,
      request.comment,
      request.status,
      request.updatedAt,
      id,
      ownerUserId,
    ]);

    return result.changes === 0 ? null : await this.getByIdForOwner(id, ownerUserId);
  },

  async delete(id: string, ownerUserId: string): Promise<boolean> {
    const result = await run(`
      DELETE FROM Requests
      WHERE id = ? AND ownerUserId = ?;
    `, [id, ownerUserId]);

    return result.changes > 0;
  },
};
