// 統一的 API 回應格式標準
// 根據客戶需求文件 Product.md 規範

export interface StandardSuccessResponse<T = any> {
  message: "success";
  data: T;
}

export interface StandardErrorResponse {
  message: string;
  errorCode: string;
  details?: any;
}

// 分頁回應格式（根據客戶需求）
export interface PaginationInfo {
  total: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StandardPaginatedResponse<T = any> {
  message: "success";
  data: T[];
  pagination: PaginationInfo;
}

// 標準化錯誤碼定義 (符合 HTTP 狀態碼規範)
export const ErrorCodes = {
  // 400 - 請求錯誤
  INVALID_REQUEST: 'invalid_request',
  
  // 401 - 未認證  
  UNAUTHORIZED: 'unauthorized',
  
  // 403 - 無權限
  FORBIDDEN: 'forbidden',
  
  // 404 - 找不到資源
  NOT_FOUND: 'not_found',
  
  // 409 - 衝突
  CONFLICT: 'conflict',
  
  // 500 - 伺服器錯誤
  INTERNAL_ERROR: 'internal_error'
} as const;

// HTTP 狀態碼對應表
export const ErrorCodeHttpStatus: Record<string, number> = {
  [ErrorCodes.INVALID_REQUEST]: 400,   // 請求錯誤
  [ErrorCodes.UNAUTHORIZED]: 401,      // 未認證
  [ErrorCodes.FORBIDDEN]: 403,         // 無權限
  [ErrorCodes.NOT_FOUND]: 404,         // 找不到資源
  [ErrorCodes.CONFLICT]: 409,          // 衝突
  [ErrorCodes.INTERNAL_ERROR]: 500     // 伺服器錯誤
};

// 輔助函數：創建成功回應
export function createSuccessResponse<T>(data: T): StandardSuccessResponse<T> {
  return {
    message: "success",
    data
  };
}

// 輔助函數：創建分頁回應
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): StandardPaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    message: "success",
    data,
    pagination: {
      total,
      perPage: limit,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

// 輔助函數：創建錯誤回應
export function createErrorResponse(
  errorCode: string,
  message?: string,
  details?: any
): StandardErrorResponse {
  return {
    message: message || errorCode,
    errorCode,
    details
  };
}