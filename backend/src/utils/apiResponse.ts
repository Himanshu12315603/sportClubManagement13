// Centralized API Response Utilities

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown;
}

export const sendSuccess = <T>(
  res: import('express').Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

export const sendError = (
  res: import('express').Response,
  message: string,
  statusCode = 500,
  errors?: unknown
): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: import('express').Response,
  data: T,
  message = 'Created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};
