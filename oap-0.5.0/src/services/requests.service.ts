import { v4 as uuid } from "uuid";
import { ApiError, type ErrorDetail } from "../errors/api-error.js";
import type { CreateRequestRequestDto, PatchRequestRequestDto } from "../dtos/requests.dto.js";
import type { EquipmentRequest, RequestStatus } from "../models/request.model.js";
import { requestsRepository } from "../repositories/requests.repository.js";
import { usersService } from "./users.service.js";
import { applyPaging, parseListQuery, sortItems } from "../utils/list-query.js";

const statuses: RequestStatus[] = ["New", "Approved", "Rejected"];
const allowedSortFields = ["itemCode", "userName", "dateFrom", "dateTo", "status", "createdAt"];

export const requestsService = {
  async getAll(query: Record<string, unknown>) {
    const listQuery = parseListQuery(query, allowedSortFields);
    const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
    const status = typeof query.status === "string" ? query.status : undefined;

    let items = await requestsRepository.getAll();

    if (search) {
      items = items.filter(
        (request) =>
          request.itemCode.includes(search) ||
          request.userName.toLowerCase().includes(search) ||
          request.comment.toLowerCase().includes(search),
      );
    }

    if (status) {
      items = items.filter((request) => request.status === status);
    }

    items = sortItems(items, listQuery.sortBy, listQuery.sortDir);

    return {
      items: applyPaging(items, listQuery.page, listQuery.pageSize),
      total: items.length,
      page: listQuery.page,
      pageSize: listQuery.pageSize,
    };
  },

  async getById(id: string): Promise<EquipmentRequest> {
    const request = await requestsRepository.getById(id);
    if (!request) throw new ApiError(404, "NOT_FOUND", "Request not found");
    return request;
  },

  async getByIdForUser(id: string, currentUserId: string): Promise<EquipmentRequest> {
    const request = await requestsRepository.getByIdForUser(id, currentUserId);
    if (!request) throw new ApiError(404, "NOT_FOUND", "Request not found");
    return request;
  },

  async searchUnsafe(query: Record<string, unknown>) {
    const q = typeof query.q === "string" ? query.q : "";
    return requestsRepository.searchSafe(q);
  },

  async getWithUsers(query: Record<string, unknown>) {
    const status = typeof query.status === "string" ? query.status : undefined;
    return requestsRepository.getWithUsers(status);
  },

  async getLatestByStatus(query: Record<string, unknown>) {
    const status = typeof query.status === "string" ? query.status : "New";
    const rawLimit = Number(query.limit ?? 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 50 ? Math.floor(rawLimit) : 10;

    if (!statuses.includes(status as RequestStatus)) {
      throw new ApiError(400, "VALIDATION_ERROR", `status must be one of: ${statuses.join(", ")}`);
    }

    return requestsRepository.getLatestByStatus(status, limit);
  },

  async getStatsByStatus() {
    return requestsRepository.getStatsByStatus();
  },

  async getFullStats(query: Record<string, unknown>) {
    const status = typeof query.status === "string" ? query.status : undefined;

    if (status && !statuses.includes(status as RequestStatus)) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        `status must be one of: ${statuses.join(", ")}`
      );
    }

    const rows = await requestsRepository.getFullStats(status);

    const totalRequests = rows.length;

    const totalComments = rows.reduce(
      (sum, row) => sum + Number(row.commentsCount),
      0
    );

    const users = new Set(rows.map((row) => row.userId));

    const byStatus = statuses.map((statusValue) => ({
      status: statusValue,
      count: rows.filter((row) => row.status === statusValue).length,
    }));

    return {
      totalRequests,
      totalComments,
      totalUsersWithRequests: users.size,
      byStatus,
      requests: rows,
    };
  },

  async create(dto: CreateRequestRequestDto, currentUserId?: string): Promise<EquipmentRequest> {
    validateRequestDto(dto);

    if (currentUserId && dto.userId !== currentUserId) {
      throw new ApiError(403, "FORBIDDEN", "Cannot create request for another user");
    }

    const user = await usersService.getById(dto.userId);
    const now = new Date().toISOString();

    return requestsRepository.add({
      id: uuid(),
      itemCode: dto.itemCode.trim(),
      userId: dto.userId,
      userName: user.fullName,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      comment: dto.comment.trim(),
      status: dto.status,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id: string, dto: CreateRequestRequestDto, currentUserId?: string): Promise<EquipmentRequest> {
    const existing = currentUserId ? await this.getByIdForUser(id, currentUserId) : await this.getById(id);
    validateRequestDto(dto);

    if (currentUserId && dto.userId !== currentUserId) {
      throw new ApiError(403, "FORBIDDEN", "Cannot transfer request to another user");
    }

    const user = await usersService.getById(dto.userId);

    const updated: EquipmentRequest = {
      ...existing,
      itemCode: dto.itemCode.trim(),
      userId: dto.userId,
      userName: user.fullName,
      dateFrom: dto.dateFrom,
      dateTo: dto.dateTo,
      comment: dto.comment.trim(),
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    return (currentUserId ? await requestsRepository.updateForUser(id, updated, currentUserId) : await requestsRepository.update(id, updated)) ?? updated;
  },

  async patch(id: string, dto: PatchRequestRequestDto, currentUserId?: string): Promise<EquipmentRequest> {
    const existing = currentUserId ? await this.getByIdForUser(id, currentUserId) : await this.getById(id);
    const merged: CreateRequestRequestDto = {
      itemCode: dto.itemCode ?? existing.itemCode,
      userId: dto.userId ?? existing.userId,
      dateFrom: dto.dateFrom ?? existing.dateFrom,
      dateTo: dto.dateTo ?? existing.dateTo,
      comment: dto.comment ?? existing.comment,
      status: dto.status ?? existing.status,
    };

    return this.update(id, merged, currentUserId);
  },

  async delete(id: string, currentUserId?: string): Promise<void> {
    const deleted = currentUserId
      ? await requestsRepository.deleteForUser(id, currentUserId)
      : await requestsRepository.delete(id);
    if (!deleted) throw new ApiError(404, "NOT_FOUND", "Request not found");
  },
};

function validateRequestDto(dto: CreateRequestRequestDto): void {
  const errors: ErrorDetail[] = [];

  if (typeof dto.itemCode !== "string" || !/^\d{3,12}$/.test(dto.itemCode.trim())) {
    errors.push({ field: "itemCode", message: "itemCode must contain 3-12 digits" });
  }

  if (typeof dto.userId !== "string" || dto.userId.trim().length === 0) {
    errors.push({ field: "userId", message: "userId is required" });
  }

  if (!isIsoDate(dto.dateFrom)) {
    errors.push({ field: "dateFrom", message: "dateFrom must be ISO date YYYY-MM-DD" });
  }

  if (!isIsoDate(dto.dateTo)) {
    errors.push({ field: "dateTo", message: "dateTo must be ISO date YYYY-MM-DD" });
  }

  if (isIsoDate(dto.dateFrom) && isIsoDate(dto.dateTo) && dto.dateFrom > dto.dateTo) {
    errors.push({ field: "dateTo", message: "dateTo must be greater than or equal to dateFrom" });
  }

  if (typeof dto.comment !== "string" || dto.comment.trim().length < 5 || dto.comment.length > 500) {
    errors.push({ field: "comment", message: "comment must be 5-500 characters" });
  }

  if (!statuses.includes(dto.status)) {
    errors.push({ field: "status", message: `status must be one of: ${statuses.join(", ")}` });
  }

  if (errors.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
  }
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
