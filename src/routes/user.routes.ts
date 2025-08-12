import { FastifyInstance } from 'fastify';
import { createUser, getUsers, getUserByUuid, updateUser, deleteUser } from '../controllers/user.controller';

async function userRoutes(fastify: FastifyInstance) {
  // Create User
  fastify.post('/', {
    schema: {
      summary: '建立使用者',
      description: '新增系統使用者',
      tags: ['User Management'],
      body: {
        type: 'object',
        required: ['account', 'password', 'code', 'name', 'userType'],
        properties: {
          account: { 
            type: 'string', 
            format: 'email',
            description: '使用者帳號 (Email)',
            examples: ['newuser@calerdo.com']
          },
          password: { 
            type: 'string', 
            minLength: 8,
            description: '使用者密碼',
            examples: ['securePass123']
          },
          code: { 
            type: 'string', 
            minLength: 3,
            maxLength: 3,
            pattern: '^[0-9]+$',
            description: '使用者代碼 (3位數字)',
            examples: ['002']
          },
          name: { 
            type: 'string', 
            minLength: 1,
            description: '使用者名稱',
            examples: ['新竹分公司']
          },
          userType: { 
            type: 'string',
            enum: ['admin', 'user', 'supplier'],
            description: '使用者類型',
            examples: ['user']
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: {
              type: 'object',
              properties: {
                uuid: { type: 'string', format: 'uuid' },
                code: { type: 'string' },
                account: { type: 'string' },
                name: { type: 'string' },
                userType: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        400: {
          $ref: 'errorResponseSchema#'
        },
        401: {
          $ref: 'unauthorizedResponseSchema#'
        },
        403: {
          $ref: 'forbiddenResponseSchema#'
        }
      }
    }
  }, createUser);

  // Get Users List
  fastify.get('/', {
    schema: {
      summary: '查詢使用者清單',
      description: '取得系統使用者清單',
      tags: ['User Management'],
      querystring: {
        type: 'object',
        properties: {
          page: { 
            type: 'integer', 
            minimum: 1, 
            default: 1,
            description: '頁數' 
          },
          limit: { 
            type: 'integer', 
            minimum: 1, 
            maximum: 100, 
            default: 20,
            description: '每頁筆數 (最多 100)' 
          },
          userType: { 
            type: 'string',
            enum: ['admin', 'user', 'supplier'],
            description: '使用者類型篩選'
          },
          code: { 
            type: 'string',
            description: '使用者代碼篩選'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      uuid: { type: 'string', format: 'uuid' },
                      code: { type: 'string' },
                      account: { type: 'string' },
                      name: { type: 'string' },
                      userType: { type: 'string' },
                      isActive: { type: 'boolean' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, getUsers);

  // Get User by UUID
  fastify.get('/:uuid', {
    schema: {
      summary: '查詢單一使用者',
      description: '根據 UUID 取得使用者詳細資訊',
      tags: ['User Management'],
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { 
            type: 'string', 
            format: 'uuid',
            description: '使用者 UUID'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: {
              type: 'object',
              properties: {
                uuid: { type: 'string', format: 'uuid' },
                code: { type: 'string' },
                account: { type: 'string' },
                name: { type: 'string' },
                userType: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
          $ref: 'errorResponseSchema#'
        }
      }
    }
  }, getUserByUuid);

  // Update User
  fastify.patch('/:uuid', {
    schema: {
      summary: '更新使用者資料',
      description: '更新指定使用者的資料',
      tags: ['User Management'],
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { 
            type: 'string', 
            format: 'uuid',
            description: '使用者 UUID'
          }
        }
      },
      body: {
        type: 'object',
        properties: {
          account: { 
            type: 'string', 
            format: 'email',
            description: '使用者帳號 (Email)'
          },
          password: { 
            type: 'string', 
            minLength: 8,
            description: '使用者密碼'
          },
          code: { 
            type: 'string', 
            minLength: 3,
            maxLength: 3,
            pattern: '^[0-9]+$',
            description: '使用者代碼 (3位數字)'
          },
          name: { 
            type: 'string', 
            minLength: 1,
            description: '使用者名稱'
          },
          userType: { 
            type: 'string',
            enum: ['admin', 'user', 'supplier'],
            description: '使用者類型'
          },
          isActive: { 
            type: 'boolean',
            description: '是否啟用'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: {
              type: 'object',
              properties: {
                uuid: { type: 'string', format: 'uuid' },
                code: { type: 'string' },
                account: { type: 'string' },
                name: { type: 'string' },
                userType: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        404: {
          $ref: 'errorResponseSchema#'
        }
      }
    }
  }, updateUser);

  // Delete User
  fastify.delete('/:uuid', {
    schema: {
      summary: '刪除使用者',
      description: '刪除指定的使用者',
      tags: ['User Management'],
      params: {
        type: 'object',
        required: ['uuid'],
        properties: {
          uuid: { 
            type: 'string', 
            format: 'uuid',
            description: '使用者 UUID'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: { type: 'null' }
          }
        },
        404: {
          $ref: 'errorResponseSchema#'
        }
      }
    }
  }, deleteUser);
}

export default userRoutes;