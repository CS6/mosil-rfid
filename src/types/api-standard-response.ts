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

// 常見錯誤碼定義
export const ErrorCodes = {
  // 認證錯誤
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',
  
  // 使用者相關
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // RFID 相關
  RFID_ALREADY_EXISTS: 'RFID_ALREADY_EXISTS',
  RFID_NOT_FOUND: 'RFID_NOT_FOUND',
  RFID_ALREADY_BOUND: 'RFID_ALREADY_BOUND',
  
  // 外箱相關
  BOX_NOT_FOUND: 'BOX_NOT_FOUND',
  BOX_ALREADY_SHIPPED: 'BOX_ALREADY_SHIPPED',
  BOX_IS_EMPTY: 'BOX_IS_EMPTY',
  
  // 出貨單相關
  SHIPMENT_NOT_FOUND: 'SHIPMENT_NOT_FOUND',
  
  // 通用錯誤
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
} as const;

// HTTP 狀態碼對應表
export const ErrorCodeHttpStatus: Record<string, number> = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCodes.AUTH_TOKEN_INVALID]: 401,
  [ErrorCodes.AUTH_PERMISSION_DENIED]: 403,
  [ErrorCodes.USER_ALREADY_EXISTS]: 409,
  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.RFID_ALREADY_EXISTS]: 409,
  [ErrorCodes.RFID_NOT_FOUND]: 404,
  [ErrorCodes.RFID_ALREADY_BOUND]: 409,
  [ErrorCodes.BOX_NOT_FOUND]: 404,
  [ErrorCodes.BOX_ALREADY_SHIPPED]: 409,
  [ErrorCodes.BOX_IS_EMPTY]: 400,
  [ErrorCodes.SHIPMENT_NOT_FOUND]: 404,
  [ErrorCodes.INVALID_PARAMETER]: 400,
  [ErrorCodes.SYSTEM_ERROR]: 500
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