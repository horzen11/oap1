import { v4 as uuid } from "uuid";
import { ApiError } from "../errors/api-error.js";
import { requestsRepository } from "../repositories/requests.repository.js";
import { usersService } from "./users.service.js";
import { applyPaging, parseListQuery, sortItems } from "../utils/list-query.js";
const statuses = ["New", "Approved", "Rejected"];
const allowedSortFields = ["itemCode", "userName", "dateFrom", "dateTo", "status", "createdAt"];
export const requestsService = {
    getAll(query) {
        const listQuery = parseListQuery(query, allowedSortFields);
        const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
        const status = typeof query.status === "string" ? query.status : undefined;
        let items = requestsRepository.getAll();
        if (search) {
            items = items.filter((request) => request.itemCode.includes(search) ||
                request.userName.toLowerCase().includes(search) ||
                request.comment.toLowerCase().includes(search));
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
    getById(id) {
        const request = requestsRepository.getById(id);
        if (!request)
            throw new ApiError(404, "NOT_FOUND", "Request not found");
        return request;
    },
    create(dto) {
        validateRequestDto(dto);
        const user = usersService.getById(dto.userId);
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
    update(id, dto) {
        const existing = this.getById(id);
        validateRequestDto(dto);
        const user = usersService.getById(dto.userId);
        const updated = {
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
        return requestsRepository.update(id, updated) ?? updated;
    },
    patch(id, dto) {
        const existing = this.getById(id);
        const merged = {
            itemCode: dto.itemCode ?? existing.itemCode,
            userId: dto.userId ?? existing.userId,
            dateFrom: dto.dateFrom ?? existing.dateFrom,
            dateTo: dto.dateTo ?? existing.dateTo,
            comment: dto.comment ?? existing.comment,
            status: dto.status ?? existing.status,
        };
        return this.update(id, merged);
    },
    delete(id) {
        const deleted = requestsRepository.delete(id);
        if (!deleted)
            throw new ApiError(404, "NOT_FOUND", "Request not found");
    },
};
function validateRequestDto(dto) {
    const errors = [];
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
function isIsoDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
