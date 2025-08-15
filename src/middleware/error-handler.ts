import { FastifyInstance, FastifyError } from 'fastify';
import { ApiErrorResponse } from '../types/api-response';

export function setupErrorHandler(app: FastifyInstance): void {
  // Handle validation errors
  app.setSchemaErrorFormatter((errors, dataVar) => {
    const error = errors[0]; // Get first validation error
    const customError = new Error(error.message || 'Validation error');
    customError.name = 'ValidationError';
    
    // Add custom properties for API response formatting
    (customError as any).errorCode = 'VALIDATION_ERROR';
    (customError as any).data = {
      field: error.instancePath?.replace('/', '') || dataVar,
      constraint: error.keyword
    };
    
    return customError;
  });

  // Handle general errors
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode || 500;
    
    // Handle validation errors (schema validation)
    if (error.validation || error.name === 'ValidationError') {
      const errorResponse: ApiErrorResponse = {
        message: error.message || 'Request validation failed',
        errorCode: (error as any).errorCode || 'VALIDATION_ERROR',
        data: (error as any).data || error.validation
      };
      
      reply.status(400).send(errorResponse);
      return;
    }

    // Handle business logic errors (thrown by use cases)
    if (statusCode >= 400 && statusCode < 500) {
      const errorCode = getErrorCode(error.message);
      const httpStatus = getHttpStatusCode(errorCode);
      
      const errorResponse: ApiErrorResponse = {
        message: error.message,
        errorCode: errorCode
      };
      
      reply.status(httpStatus).send(errorResponse);
      return;
    }

    // Handle server errors
    const errorResponse: ApiErrorResponse = {
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      data: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    reply.status(500).send(errorResponse);
  });
}

function getErrorCode(message: string): string {
  // 根據 HTTP 狀態碼規範的錯誤碼對應
  const errorMap: Record<string, string> = {
    // 400 - 請求錯誤 (invalid_request)
    'Invalid start serial number': 'invalid_request',
    'Quantity must be between 1 and 1000': 'invalid_request',
    'Serial number exceeds 9999': 'invalid_request',
    'ProductNo .* does not match SKU prefix': 'invalid_request',
    
    // 401 - 未認證 (unauthorized)
    'Token expired': 'unauthorized',
    'Invalid token': 'unauthorized',
    'Authentication required': 'unauthorized',
    
    // 403 - 無權限 (forbidden)
    'User is not active': 'forbidden',
    'Insufficient permissions': 'forbidden',
    'Access denied': 'forbidden',
    
    // 404 - 找不到資源 (not_found)
    'User not found': 'not_found',
    'Box .* not found': 'not_found',
    'RFID .* not found': 'not_found',
    'Shipment not found': 'not_found',
    
    // 409 - 衝突 (conflict)
    'RFID .* already exists': 'conflict',
    'Serial number .* already exists': 'conflict',
    'RFID .* already assigned to box': 'conflict',
    'Box already shipped': 'conflict'
  };

  for (const [pattern, code] of Object.entries(errorMap)) {
    if (new RegExp(pattern).test(message)) {
      return code;
    }
  }

  return 'invalid_request'; // 預設為請求錯誤
}

function getHttpStatusCode(errorCode: string): number {
  // 根據你的 HTTP 狀態碼規範對應（只處理錯誤狀態碼）
  const statusMap: Record<string, number> = {
    'invalid_request': 400,    // 400 - 請求錯誤：參數驗證失敗
    'unauthorized': 401,       // 401 - 未認證：Token 無效或過期  
    'forbidden': 403,          // 403 - 無權限：權限不足
    'not_found': 404,          // 404 - 找不到資源：資源不存在
    'conflict': 409,           // 409 - 衝突：業務邏輯衝突
    'internal_error': 500      // 500 - 伺服器錯誤：系統內部錯誤
  };

  return statusMap[errorCode] || 400; // 預設為 400
}