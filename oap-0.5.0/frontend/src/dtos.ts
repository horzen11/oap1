export type RequestStatus = "New" | "Approved" | "Rejected";

export interface UserResponseDto {
  id: string;
  fullName: string;
  email: string;
  role: "Student" | "Teacher" | "Admin";
  createdAt: string;
}

export interface RequestResponseDto {
  id: string;
  itemCode: string;
  userId: string;
  userName: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestRequestDto {
  itemCode: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  status: RequestStatus;
}

export interface ListResponseDto<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorDto {
  status: number;
  code: string;
  message: string;
  details: ApiErrorDetail[] | string | null;
}
export interface CreateUserRequestDto {
  fullName: string;
  email: string;
  role: string;
}