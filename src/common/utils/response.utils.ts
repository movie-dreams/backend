import {
  ErrorResponse,
  FailResponse,
  PaginatedResponse,
  SuccessResponse,
} from '../interfaces/custom-response.interface.js';
import { handleError } from '../interfaces/custom-error.interface.js';

export class ResponseUtils {
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number,
    message = 'Consulta exitosa',
  ): PaginatedResponse<T> {
    return {
      status: 'success',
      message,
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, code?: string, details?: unknown): ErrorResponse {
    return {
      status: 'error',
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static fail(message: string, data?: unknown): FailResponse {
    return {
      status: 'fail',
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static fromError(
    error: unknown,
    defaultMessage: string,
  ): { response: ErrorResponse; statusCode: number } {
    const { statusCode, message } = handleError(error, defaultMessage);
    return {
      response: {
        status: 'error',
        message,
        errors: error instanceof Error ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    };
  }
}