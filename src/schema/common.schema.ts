/*
* Simple global schemas that are going to be used across all of our app.
*
* See More: https://www.fastify.io/docs/latest/Reference/Validation-and-Serialization/
*/

// Cursor Pagination: take and from values.
// - from must match the MongoDB document id pattern
export const paginationSchema = {
  $id: 'paginationSchema',
  type: 'object',
  properties: {
    take: {
      type: 'number',
      enum: [5, 10, 25],
      default: 10,
    },
    from: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
  },
};

// Just a single response object including a message
export const messageSchema = {
  $id: 'messageResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};

// Standard error response for API endpoints
export const errorResponseSchema = {
  $id: 'errorResponseSchema',
  type: 'object',
  properties: {
    message: { 
      type: 'string',
      description: '錯誤描述',
      examples: ['參數驗證失敗', 'RFID 已存在', '使用者不存在', '權限不足']
    },
    errorCode: { 
      type: 'string',
      enum: ['invalid_request', 'unauthorized', 'forbidden', 'not_found', 'conflict', 'internal_error'],
      description: '標準錯誤碼'
    },
    data: { 
      type: 'object', 
      nullable: true,
      description: '錯誤詳細資訊（統一使用 data 欄位）'
    }
  },
  required: ['message', 'errorCode']
};

// Standard success response schema
export const successResponseSchema = {
  $id: 'successResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string', enum: ['success'] },
    data: { type: 'object' }
  },
  required: ['message', 'data']
};

// Standard pagination schema  
export const paginationResponseSchema = {
  $id: 'paginationResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string', enum: ['success'] },
    data: { type: 'array' },
    pagination: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        perPage: { type: 'number' },
        currentPage: { type: 'number' },
        totalPages: { type: 'number' },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' }
      },
      required: ['total', 'perPage', 'currentPage', 'totalPages', 'hasNext', 'hasPrev']
    }
  },
  required: ['message', 'data', 'pagination']
};

// Standard authentication error responses
export const unauthorizedResponseSchema = {
  $id: 'unauthorizedResponseSchema',
  type: 'object',
  properties: {
    message: { 
      type: 'string', 
      description: '未認證錯誤描述',
      examples: ['Token 無效或過期', '請提供有效的認證憑證', '登入已過期']
    },
    errorCode: { 
      type: 'string', 
      enum: ['unauthorized'],
      description: '未認證錯誤碼'
    },
    data: { 
      type: 'object', 
      nullable: true,
      description: '錯誤詳細資訊（統一使用 data 欄位）'
    }
  },
  required: ['message', 'errorCode']
};

export const forbiddenResponseSchema = {
  $id: 'forbiddenResponseSchema',
  type: 'object',
  properties: {
    message: { 
      type: 'string', 
      description: '權限不足錯誤描述',
      examples: ['權限不足', '使用者未啟用', '存取被拒絕']
    },
    errorCode: { 
      type: 'string', 
      enum: ['forbidden'],
      description: '權限錯誤碼'
    },
    data: { 
      type: 'object', 
      nullable: true,
      description: '錯誤詳細資訊（統一使用 data 欄位）'
    }
  },
  required: ['message', 'errorCode']
};

// Used to validate/match URLS that include an ':id' param
export const paramIdSchema = {
  $id: 'paramIdSchema',
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  required: ['id'],
};

