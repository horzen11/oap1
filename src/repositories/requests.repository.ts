import type { EquipmentRequest } from "../models/request.model.js";
import { all, get, run } from "../db/dbClient.js";
import { sqlString } from "../db/sql.js";

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
    return get<EquipmentRequest>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.id = ${sqlString(id)};
    `).then((row) => row ?? null);
  },

  searchUnsafe(q: string): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.itemCode LIKE '%${q}%'
         OR r.comment LIKE '%${q}%'
         OR u.fullName LIKE '%${q}%'
      ORDER BY r.createdAt DESC;
    `);
  },

  getWithUsers(status?: string): Promise<RequestWithUserRow[]> {
    const where = status ? `WHERE r.status = ${sqlString(status)}` : "";
    return all<RequestWithUserRow>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName, u.email AS userEmail, u.role AS userRole,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      ${where}
      ORDER BY r.createdAt DESC;
    `);
  },


  getLatestByStatus(status: string, limit: number): Promise<EquipmentRequest[]> {
    return all<EquipmentRequest>(`
      SELECT r.id, r.itemCode, r.userId, u.fullName AS userName,
             r.dateFrom, r.dateTo, r.comment, r.status, r.createdAt, r.updatedAt
      FROM Requests r
      JOIN Users u ON u.id = r.userId
      WHERE r.status = ${sqlString(status)}
      ORDER BY r.createdAt DESC
      LIMIT ${Number(limit)};
    `);
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
    const where = status ? `WHERE r.status = ${sqlString(status)}` : "";

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
    `);
  },
  async add(request: EquipmentRequest): Promise<EquipmentRequest> {
    await run(`
      INSERT INTO Requests (id, itemCode, userId, dateFrom, dateTo, comment, status, createdAt, updatedAt)
      VALUES (
        ${sqlString(request.id)},
        ${sqlString(request.itemCode)},
        ${sqlString(request.userId)},
        ${sqlString(request.dateFrom)},
        ${sqlString(request.dateTo)},
        ${sqlString(request.comment)},
        ${sqlString(request.status)},
        ${sqlString(request.createdAt)},
        ${sqlString(request.updatedAt)}
      );
    `);
    return (await this.getById(request.id)) ?? request;
  },

  async update(id: string, request: EquipmentRequest): Promise<EquipmentRequest | null> {
    const result = await run(`
      UPDATE Requests
      SET itemCode = ${sqlString(request.itemCode)},
          userId = ${sqlString(request.userId)},
          dateFrom = ${sqlString(request.dateFrom)},
          dateTo = ${sqlString(request.dateTo)},
          comment = ${sqlString(request.comment)},
          status = ${sqlString(request.status)},
          updatedAt = ${sqlString(request.updatedAt)}
      WHERE id = ${sqlString(id)};
    `);
    return result.changes === 0 ? null : await this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    const result = await run(`
      DELETE FROM Requests
      WHERE id = ${sqlString(id)};
    `);
    return result.changes > 0;
  },
};
