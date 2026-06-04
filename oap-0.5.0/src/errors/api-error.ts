export type ErrorDetail = {
  field?: string;
  message: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: ErrorDetail[] | null = null,
  ) {
    super(message);
  }
}
