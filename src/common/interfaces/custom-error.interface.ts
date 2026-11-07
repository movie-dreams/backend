export interface CustomError {
  status?: number;
  message?: string;
  response?: unknown;
  errors?: unknown;
  code?: string;
  details?: unknown;
}

export function isCustomError(error: unknown): error is CustomError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'message' in error || 'code' in error)
  );
}

export function handleError(
  error: unknown,
  defaultMessage: string,
): { statusCode: number; message: string; errors?: unknown } {
  if (isCustomError(error)) {
    return {
      statusCode: error.status ?? 500,
      message: error.message ?? defaultMessage,
      errors:
        error.response && typeof error.response === 'object' && 'errors' in error.response
          ? (error.response as { errors?: unknown }).errors
          : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: defaultMessage,
  };
}