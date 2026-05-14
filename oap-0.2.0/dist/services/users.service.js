import { v4 as uuid } from "uuid";
import { ApiError } from "../errors/api-error.js";
import { usersRepository } from "../repositories/users.repository.js";
import { applyPaging, parseListQuery, sortItems } from "../utils/list-query.js";
const roles = ["Student", "Teacher", "Admin"];
const allowedSortFields = ["fullName", "email", "role", "createdAt"];
export const usersService = {
    getAll(query) {
        const listQuery = parseListQuery(query, allowedSortFields);
        const search = typeof query.search === "string" ? query.search.toLowerCase() : "";
        const role = typeof query.role === "string" ? query.role : undefined;
        let items = usersRepository.getAll();
        if (search) {
            items = items.filter((user) => user.fullName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search));
        }
        if (role) {
            items = items.filter((user) => user.role === role);
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
        const user = usersRepository.getById(id);
        if (!user)
            throw new ApiError(404, "NOT_FOUND", "User not found");
        return user;
    },
    create(dto) {
        validateUserDto(dto);
        if (usersRepository.getByEmail(dto.email)) {
            throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", [
                { field: "email", message: "User with this email already exists" },
            ]);
        }
        return usersRepository.add({
            id: uuid(),
            fullName: dto.fullName.trim(),
            email: dto.email.trim().toLowerCase(),
            role: dto.role,
            createdAt: new Date().toISOString(),
        });
    },
    update(id, dto) {
        const existing = this.getById(id);
        validateUserDto(dto);
        const duplicate = usersRepository.getByEmail(dto.email);
        if (duplicate && duplicate.id !== id) {
            throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", [
                { field: "email", message: "User with this email already exists" },
            ]);
        }
        const updated = {
            ...existing,
            fullName: dto.fullName.trim(),
            email: dto.email.trim().toLowerCase(),
            role: dto.role,
        };
        return usersRepository.update(id, updated) ?? updated;
    },
    delete(id) {
        const deleted = usersRepository.delete(id);
        if (!deleted)
            throw new ApiError(404, "NOT_FOUND", "User not found");
    },
};
function validateUserDto(dto) {
    const errors = [];
    if (typeof dto.fullName !== "string" || dto.fullName.trim().length < 2) {
        errors.push({ field: "fullName", message: "fullName must be at least 2 characters" });
    }
    if (typeof dto.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dto.email)) {
        errors.push({ field: "email", message: "email must be valid" });
    }
    if (!roles.includes(dto.role)) {
        errors.push({ field: "role", message: `role must be one of: ${roles.join(", ")}` });
    }
    if (errors.length > 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    }
}
