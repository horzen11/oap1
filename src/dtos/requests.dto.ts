import type { EquipmentRequest, RequestStatus } from "../models/request.model.js";

export type CreateRequestRequestDto = {
  itemCode: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: RequestStatus;
};

export type UpdateRequestRequestDto = CreateRequestRequestDto;

export type PatchRequestRequestDto = Partial<CreateRequestRequestDto>;

export type RequestResponseDto = {
  id: string;
  itemCode: string;
  userId: string;
  userName: string;
  ownerUserId: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

export function toRequestResponseDto(request: EquipmentRequest): RequestResponseDto {
  return {
    id: request.id,
    itemCode: request.itemCode,
    userId: request.userId,
    userName: request.userName,
    ownerUserId: request.ownerUserId,
    dateFrom: request.dateFrom,
    dateTo: request.dateTo,
    comment: request.comment,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}
