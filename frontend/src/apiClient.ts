import { API_BASE_URL, REQUESTS_PATH, USERS_PATH } from "./config";
import type {
  ApiErrorDto,
  CreateRequestRequestDto,
  CreateUserRequestDto,
  ListResponseDto,
  RequestResponseDto,
  UserResponseDto,
} from "./dtos";

const DEMO_USER_ID = "demo-user-1";

function withDemoUserHeaders(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    "X-Demo-UserId": DEMO_USER_ID,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: withDemoUserHeaders(options.headers),
    });
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

  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  throw {
    status: response.status,
    code: payload?.error?.code ?? "HTTP_ERROR",
    message: payload?.error?.message ?? text ?? "HTTP помилка",
    details: payload?.error?.details ?? text,
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
  return request<RequestResponseDto>(`${REQUESTS_PATH}/${encodeURIComponent(id)}`);
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
  return request<RequestResponseDto>(`${REQUESTS_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });
}

export async function removeRequest(id: string) {
  return request<null>(`${REQUESTS_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getUsers() {
  return request<ListResponseDto<UserResponseDto>>(`${USERS_PATH}?page=1&pageSize=100`);
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
