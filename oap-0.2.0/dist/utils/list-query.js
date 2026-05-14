import { ApiError } from "../errors/api-error.js";
export function parseListQuery(query, allowedSortFields) {
    const page = parsePositiveInteger(query.page, 1, "page");
    const pageSize = parsePositiveInteger(query.pageSize, 10, "pageSize");
    const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
    const sortDir = query.sortDir === "desc" ? "desc" : "asc";
    if (sortBy && !allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid query params", [
            { field: "sortBy", message: `sortBy must be one of: ${allowedSortFields.join(", ")}` },
        ]);
    }
    return { page, pageSize, sortBy, sortDir };
}
function parsePositiveInteger(value, fallback, field) {
    if (value === undefined)
        return fallback;
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 100) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid query params", [
            { field, message: `${field} must be an integer from 1 to 100` },
        ]);
    }
    return numberValue;
}
export function applyPaging(items, page, pageSize) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}
export function sortItems(items, sortBy, sortDir) {
    if (!sortBy)
        return items;
    return [...items].sort((a, b) => {
        const left = String(a[sortBy] ?? "").toLowerCase();
        const right = String(b[sortBy] ?? "").toLowerCase();
        if (left < right)
            return sortDir === "asc" ? -1 : 1;
        if (left > right)
            return sortDir === "asc" ? 1 : -1;
        return 0;
    });
}
