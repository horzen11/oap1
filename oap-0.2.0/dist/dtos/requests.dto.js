export function toRequestResponseDto(request) {
    return {
        id: request.id,
        itemCode: request.itemCode,
        userId: request.userId,
        userName: request.userName,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        comment: request.comment,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
    };
}
