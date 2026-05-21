import { v4 as uuid } from "uuid";
import { ApiError, type ErrorDetail } from "../errors/api-error.js";
import type {
  CreateRequestCommentRequestDto,
  PatchRequestCommentRequestDto,
} from "../dtos/request-comments.dto.js";
import type { RequestComment } from "../models/request-comment.model.js";
import { requestCommentsRepository } from "../repositories/request-comments.repository.js";
import { requestsService } from "./requests.service.js";
import { usersService } from "./users.service.js";

export const requestCommentsService = {
  getAll(): Promise<RequestComment[]> {
    return requestCommentsRepository.getAll();
  },

  async getById(id: string): Promise<RequestComment> {
    const comment = await requestCommentsRepository.getById(id);
    if (!comment) throw new ApiError(404, "NOT_FOUND", "Comment not found");
    return comment;
  },

  getByRequestId(requestId: string): Promise<RequestComment[]> {
    return requestCommentsRepository.getByRequestId(requestId);
  },

  async create(dto: CreateRequestCommentRequestDto): Promise<RequestComment> {
    validateCommentDto(dto);
    await requestsService.getById(dto.requestId);
    const user = await usersService.getById(dto.userId);
    const now = new Date().toISOString();

    return requestCommentsRepository.add({
      id: uuid(),
      requestId: dto.requestId,
      userId: dto.userId,
      userName: user.fullName,
      body: dto.body.trim(),
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id: string, dto: CreateRequestCommentRequestDto): Promise<RequestComment> {
    const existing = await this.getById(id);
    validateCommentDto(dto);
    await requestsService.getById(dto.requestId);
    const user = await usersService.getById(dto.userId);

    const updated: RequestComment = {
      ...existing,
      requestId: dto.requestId,
      userId: dto.userId,
      userName: user.fullName,
      body: dto.body.trim(),
      updatedAt: new Date().toISOString(),
    };

    return (await requestCommentsRepository.update(id, updated)) ?? updated;
  },

  async patch(id: string, dto: PatchRequestCommentRequestDto): Promise<RequestComment> {
    const existing = await this.getById(id);
    const merged: CreateRequestCommentRequestDto = {
      requestId: dto.requestId ?? existing.requestId,
      userId: dto.userId ?? existing.userId,
      body: dto.body ?? existing.body,
    };
    return this.update(id, merged);
  },

  async delete(id: string): Promise<void> {
    const deleted = await requestCommentsRepository.delete(id);
    if (!deleted) throw new ApiError(404, "NOT_FOUND", "Comment not found");
  },
};

function validateCommentDto(dto: CreateRequestCommentRequestDto): void {
  const errors: ErrorDetail[] = [];

  if (typeof dto.requestId !== "string" || dto.requestId.trim().length === 0) {
    errors.push({ field: "requestId", message: "requestId is required" });
  }

  if (typeof dto.userId !== "string" || dto.userId.trim().length === 0) {
    errors.push({ field: "userId", message: "userId is required" });
  }

  if (typeof dto.body !== "string" || dto.body.trim().length < 3 || dto.body.length > 500) {
    errors.push({ field: "body", message: "body must be 3-500 characters" });
  }

  if (errors.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
  }
}
