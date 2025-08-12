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
    (customError as any).details = {
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
        details: (error as any).details || error.validation
      };
      
      reply.status(400).send(errorResponse);
      return;
    }

    // Handle business logic errors (thrown by use cases)
    if (statusCode >= 400 && statusCode < 500) {
      const errorResponse: ApiErrorResponse = {
        message: error.message,
        errorCode: getErrorCode(error.message)
      };
      
      reply.status(statusCode).send(errorResponse);
      return;
    }

    // Handle server errors
    const errorResponse: ApiErrorResponse = {
      message: 'Internal server error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    reply.status(500).send(errorResponse);
  });
}

function getErrorCode(message: string): string {
  const errorMap: Record<string, string> = {
    'User not found': 'USER_NOT_FOUND',
    'User is not active': 'USER_INACTIVE',
    'RFID .* already exists': 'RFID_ALREADY_EXISTS',
    'Serial number .* already exists': 'SERIAL_NUMBER_EXISTS',
    'ProductNo .* does not match SKU prefix': 'PRODUCT_NO_MISMATCH',
    'Box .* not found': 'BOX_NOT_FOUND',
    'RFID .* not found': 'RFID_NOT_FOUND',
    'RFID .* already assigned to box': 'RFID_ALREADY_IN_BOX',
    'Invalid start serial number': 'INVALID_SERIAL_NUMBER',
    'Quantity must be between 1 and 1000': 'INVALID_QUANTITY',
    'Serial number exceeds 9999': 'SERIAL_NUMBER_OVERFLOW'
  };

  for (const [pattern, code] of Object.entries(errorMap)) {
    if (new RegExp(pattern).test(message)) {
      return code;
    }
  }

  return 'BUSINESS_LOGIC_ERROR';
}