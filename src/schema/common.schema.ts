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
    message: { type: 'string' },
    errorCode: { type: 'string' },
    details: { type: 'object', nullable: true }
  },
  required: ['message', 'errorCode']
};

// Standard authentication error responses
export const unauthorizedResponseSchema = {
  $id: 'unauthorizedResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string', examples: ['Unauthorized', 'Token expired', 'Invalid token'] },
    errorCode: { type: 'string', examples: ['UNAUTHORIZED', 'TOKEN_EXPIRED', 'INVALID_TOKEN'] },
    details: { type: 'object', nullable: true }
  },
  required: ['message', 'errorCode']
};

export const forbiddenResponseSchema = {
  $id: 'forbiddenResponseSchema',
  type: 'object',
  properties: {
    message: { type: 'string', examples: ['Forbidden', 'Insufficient permissions', 'Access denied'] },
    errorCode: { type: 'string', examples: ['FORBIDDEN', 'INSUFFICIENT_PERMISSIONS', 'ACCESS_DENIED'] },
    details: { type: 'object', nullable: true }
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

