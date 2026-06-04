import type { RequestComment } from "../models/request-comment.model.js";

export type CreateRequestCommentRequestDto = {
  requestId: string;
  userId: string;
  body: string;
};

export type UpdateRequestCommentRequestDto = CreateRequestCommentRequestDto;

export type PatchRequestCommentRequestDto = Partial<CreateRequestCommentRequestDto>;

export type RequestCommentResponseDto = {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function toRequestCommentResponseDto(comment: RequestComment): RequestCommentResponseDto {
  return {
    id: comment.id,
    requestId: comment.requestId,
    userId: comment.userId,
    userName: comment.userName,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}
