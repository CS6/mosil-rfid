export interface ApiSuccessResponse<T = any> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errorCode: string;
  details?: any;
}

export interface PaginationInfo {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginatedResponse<T = any> {
  message: string;
  data: T[];
  pagination: PaginationInfo;
}