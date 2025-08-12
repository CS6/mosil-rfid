import { FastifyInstance } from 'fastify';
import { login, refreshToken } from '../controllers/auth.controller';

async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', {
    schema: {
      summary: '使用者登入',
      description: '驗證帳號密碼，取得 JWT Token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['account', 'password'],
        properties: {
          account: { 
            type: 'string', 
            format: 'email',
            description: '使用者帳號 (Email)',
            examples: ['user@calerdo.com']
          },
          password: { 
            type: 'string', 
            minLength: 8,
            description: '使用者密碼',
            examples: ['password123']
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                uuid: { type: 'string', format: 'uuid', description: '使用者 UUID' },
                code: { type: 'string', description: '使用者代碼' },
                account: { type: 'string', description: '使用者帳號' },
                name: { type: 'string', description: '使用者名稱' },
                userType: { 
                  type: 'string', 
                  enum: ['admin', 'user', 'supplier'],
                  description: '使用者類型' 
                },
                accessToken: { type: 'string', description: 'JWT Access Token' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errorCode: { type: 'string' },
            details: { type: 'object', nullable: true }
          }
        }
      }
    }
  }, login);

  // Refresh Token
  fastify.post('/refresh', {
    schema: {
      summary: 'Token 更新',
      description: '更新即將過期的 Token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          refreshToken: { 
            type: 'string',
            description: 'Refresh Token (可選，可能在 Cookie 中)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', description: '新的 Access Token' },
                refreshToken: { type: 'string', description: '新的 Refresh Token' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errorCode: { type: 'string' },
            details: { type: 'object', nullable: true }
          }
        }
      }
    }
  }, refreshToken);
}

export default authRoutes;