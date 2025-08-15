// 統一的 API 回應格式標準
// 根據客戶需求文件 Product.md 規範

export interface StandardSuccessResponse<T = any> {
  message: "success";
  data: T;
}

export interface StandardErrorResponse {
  message: string;
  errorCode: string;
  data?: any;  // 統一使用 data 欄位
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

// HTTP 狀態碼完整定義（依照你的規範）
export const HttpStatusCodes = {
  // 成功狀態碼
  OK: 200,                    // 成功：GET、PUT、PATCH 成功
  CREATED: 201,               // 建立成功：POST 新增資源成功
  NO_CONTENT: 204,            // 無內容：DELETE 成功或無需回傳資料
  
  // 錯誤狀態碼
  BAD_REQUEST: 400,           // 請求錯誤：參數驗證失敗
  UNAUTHORIZED: 401,          // 未認證：Token 無效或過期
  FORBIDDEN: 403,             // 無權限：權限不足
  NOT_FOUND: 404,             // 找不到資源：資源不存在
  CONFLICT: 409,              // 衝突：業務邏輯衝突
  INTERNAL_SERVER_ERROR: 500  // 伺服器錯誤：系統內部錯誤
} as const;

// 錯誤碼對應 HTTP 狀態碼表
export const ErrorCodeHttpStatus: Record<string, number> = {
  [ErrorCodes.INVALID_REQUEST]: HttpStatusCodes.BAD_REQUEST,     // 400
  [ErrorCodes.UNAUTHORIZED]: HttpStatusCodes.UNAUTHORIZED,       // 401
  [ErrorCodes.FORBIDDEN]: HttpStatusCodes.FORBIDDEN,             // 403
  [ErrorCodes.NOT_FOUND]: HttpStatusCodes.NOT_FOUND,             // 404
  [ErrorCodes.CONFLICT]: HttpStatusCodes.CONFLICT,               // 409
  [ErrorCodes.INTERNAL_ERROR]: HttpStatusCodes.INTERNAL_SERVER_ERROR // 500
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
  data?: any
): StandardErrorResponse {
  return {
    message: message || errorCode,
    errorCode,
    data  // 統一使用 data 欄位
  };
}