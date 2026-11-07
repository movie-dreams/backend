export type SuccessResponse<T> = {
  status: 'success';
  message?: string;
  data: T;
  timestamp: string;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
  errors?: unknown;
  code?: string;
  details?: unknown;
  timestamp: string;
};

export type FailResponse = {
  status: 'fail';
  message: string;
  data?: unknown;
  timestamp: string;
};

export interface PaginatedResponse<T> {
  status: 'success';
  message?: string;
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  timestamp: string;
}