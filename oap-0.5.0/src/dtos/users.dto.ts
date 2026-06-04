import type { User, UserRole } from "../models/user.model.js";

export type CreateUserRequestDto = {
  fullName: string;
  email: string;
  role: UserRole;
};

export type UpdateUserRequestDto = CreateUserRequestDto;

export type UserResponseDto = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
