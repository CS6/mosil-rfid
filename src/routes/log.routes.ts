import { FastifyInstance } from 'fastify';
import { queryLogs, getLogSummary } from '../controllers/log.controller';

async function logRoutes(fastify: FastifyInstance) {
  // Query System Logs
  fastify.get('/', {
    schema: {
      summary: '查詢系統日誌',
      description: '根據條件查詢系統操作日誌',
      tags: ['System Logs'],
      querystring: {
        type: 'object',
        properties: {
          userUuid: { 
            type: 'string',
            format: 'uuid',
            description: '使用者 UUID 篩選'
          },
          action: { 
            type: 'string',
            description: '操作動作篩選 (例如: LOGIN_SUCCESS, CREATE_RFID)'
          },
          targetType: { 
            type: 'string',
            description: '目標類型篩選 (例如: User, ProductRfid, Box)'
          },
          targetId: { 
            type: 'string',
            description: '目標 ID 篩選'
          },
          startDate: { 
            type: 'string',
            format: 'date-time',
            description: '起始日期 (ISO 8601 格式)'
          },
          endDate: { 
            type: 'string',
            format: 'date-time',
            description: '結束日期 (ISO 8601 格式)'
          },
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
            default: 50,
            description: '每頁筆數 (最多 100)' 
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
                logs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      userUuid: { type: 'string', format: 'uuid' },
                      userName: { type: 'string', nullable: true },
                      action: { type: 'string' },
                      targetType: { type: 'string', nullable: true },
                      targetId: { type: 'string', nullable: true },
                      description: { type: 'string', nullable: true },
                      ipAddress: { type: 'string', nullable: true },
                      createdAt: { type: 'string', format: 'date-time' }
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
  }, queryLogs);

  // Get Log Summary
  fastify.get('/summary', {
    schema: {
      summary: '取得系統日誌摘要',
      description: '取得系統日誌統計摘要資訊',
      tags: ['System Logs'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string', enum: ['success'] },
            data: {
              type: 'object',
              properties: {
                totalLogs: { type: 'number', description: '總日誌數' },
                uniqueUsers: { type: 'number', description: '獨立使用者數' },
                mostCommonActions: {
                  type: 'array',
                  description: '最常見的操作',
                  items: {
                    type: 'object',
                    properties: {
                      action: { type: 'string' },
                      count: { type: 'number' }
                    }
                  }
                },
                recentActivity: {
                  type: 'array',
                  description: '最近活動',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      userUuid: { type: 'string', format: 'uuid' },
                      userName: { type: 'string', nullable: true },
                      action: { type: 'string' },
                      targetType: { type: 'string', nullable: true },
                      targetId: { type: 'string', nullable: true },
                      description: { type: 'string', nullable: true },
                      ipAddress: { type: 'string', nullable: true },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, getLogSummary);
}

export default logRoutes;