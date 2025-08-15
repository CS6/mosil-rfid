export interface ApiSuccessResponse<T = any> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errorCode: string;
  data?: any;  // 統一使用 data 欄位
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