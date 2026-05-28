import { API_BASE_URL, REQUESTS_PATH, USERS_PATH } from "./config";
import type {
  ApiErrorDto,
  CreateRequestRequestDto,
  CreateUserRequestDto,
  ListResponseDto,
  RequestResponseDto,
  UserResponseDto,
} from "./dtos";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw {
      status: 0,
      code: "NETWORK_ERROR",
      message: "Помилка мережі або CORS",
      details: error instanceof Error ? error.message : String(error),
    } satisfies ApiErrorDto;
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();

  if (response.ok) {
    return text ? (JSON.parse(text) as T) : (null as T);
  }

  throw {
    status: response.status,
    code: "HTTP_ERROR",
    message: text || "HTTP помилка",
    details: text,
  } satisfies ApiErrorDto;
}

export async function getRequests(
  search = "",
  sortBy = "itemCode",
  sortDir: "asc" | "desc" = "asc"
) {
  const params = new URLSearchParams({
    page: "1",
    pageSize: "100",
    sortBy,
    sortDir,
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return request<ListResponseDto<RequestResponseDto>>(
    `${REQUESTS_PATH}?${params.toString()}`
  );
}

export async function getRequestById(id: string) {
  return request<RequestResponseDto>(
    `${REQUESTS_PATH}/${encodeURIComponent(id)}`
  );
}

export async function createRequest(dto: CreateRequestRequestDto) {
  return request<RequestResponseDto>(REQUESTS_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });
}

export async function updateRequest(id: string, dto: CreateRequestRequestDto) {
  return request<RequestResponseDto>(
    `${REQUESTS_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    }
  );
}

export async function removeRequest(id: string) {
  return request<null>(`${REQUESTS_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getUsers() {
  return request<ListResponseDto<UserResponseDto>>(
    `${USERS_PATH}?page=1&pageSize=100`
  );
}

export async function createUser(dto: CreateUserRequestDto) {
  return request<UserResponseDto>(USERS_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });
}