import { FastifyInstance } from 'fastify';
import { createRfid, batchCreateRfid, generateProductRfids, queryProductRfids } from '../controllers/rfid.controller';

async function rfidRoutes(fastify: FastifyInstance) {
  // Create Single RFID (kept for backward compatibility)
  fastify.post('/rfid', {
    schema: {
      summary: '建立單一 RFID 標籤',
      description: '建立新的 RFID 標籤 (RFID = SKU + SerialNo = 17碼)',
      tags: ['RFID'],
      body: {
        type: 'object',
        required: ['sku', 'serialNo'],
        properties: {
          sku: {
            type: 'string',
            minLength: 13,
            maxLength: 13,
            pattern: '^[A-Z0-9]+$',
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼',
            examples: ['A252600201234', '6G970CR9T7MZ7']
          },
          productNo: {
            type: 'string',
            minLength: 8,
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: '貨號 (選填，預設從 SKU 前8碼自動產生)',
            examples: ['A2526002', '6G970CR9']
          },
          serialNo: {
            type: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: '流水號 (4位數字)',
            examples: ['0001', '0414']
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                rfid: { type: 'string' },
                sku: { type: 'string' },
                productNo: { type: 'string' },
                serialNo: { type: 'string' },
                boxNo: { type: 'string', nullable: true },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
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
  }, createRfid);

  // Batch Create RFIDs
  fastify.post('/rfid/batch', {
    schema: {
      summary: '批次產生 RFID 標籤',
      description: '批次產生多個連續序號的 RFID 標籤（最多 1000 個）',
      tags: ['RFID'],
      body: {
        type: 'object',
        required: ['sku', 'startSerialNo', 'quantity'],
        properties: {
          sku: {
            type: 'string',
            minLength: 13,
            maxLength: 13,
            pattern: '^[A-Z0-9]+$',
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼 (例: SHIRT001REDXL)'
          },
          productNo: {
            type: 'string',
            minLength: 8,
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: '貨號 (選填，預設從 SKU 前8碼自動產生) (例: SHIRT001)'
          },
          startSerialNo: {
            type: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: '起始流水號 (4位數字) (例: 0001)'
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 1000,
            description: '要產生的數量 (1-1000) (例: 10)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                totalRequested: { type: 'number' },
                totalCreated: { type: 'number' },
                failed: { type: 'number' },
                rfids: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rfid: { type: 'string' },
                      sku: { type: 'string' },
                      productNo: { type: 'string' },
                      serialNo: { type: 'string' },
                      status: { type: 'string', enum: ['created', 'skipped'] },
                      reason: { type: 'string', nullable: true }
                    }
                  }
                }
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
  }, batchCreateRfid);

  // Generate Product RFID Labels - New specification format
  fastify.post('/rfids/products', {
    schema: {
      summary: '批次產生商品 RFID 標籤',
      description: '批次產生商品 RFID 標籤，根據 SKU 和數量產生',
      tags: ['RFID'],
      body: {
        type: 'object',
        required: ['sku', 'quantity'],
        properties: {
          sku: {
            type: 'string',
            minLength: 13,
            maxLength: 13,
            pattern: '^[A-Z0-9]+$',
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼',
            examples: ['A252600201234']
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 1000,
            description: '要產生的數量 (1-1000)',
            examples: [100]
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                sku: { 
                  type: 'string',
                  description: '商品 SKU',
                  examples: ['A252600201234']
                },
                generatedCount: { 
                  type: 'number',
                  description: '實際產生的數量',
                  examples: [100]
                },
                startSerial: { 
                  type: 'string',
                  description: '起始流水號',
                  examples: ['0001']
                },
                endSerial: { 
                  type: 'string',
                  description: '結束流水號',
                  examples: ['0100']
                },
                rfids: {
                  type: 'array',
                  description: '產生的 RFID 清單',
                  items: { 
                    type: 'string',
                    examples: ['A2526002012340001', 'A2526002012340002']
                  }
                }
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
  }, generateProductRfids);

  // Query Product RFID Labels
  fastify.get('/rfids/products', {
    schema: {
      summary: '查詢商品 RFID 標籤',
      description: '根據條件查詢商品 RFID 標籤',
      tags: ['RFID'],
      querystring: {
        type: 'object',
        properties: {
          sku: { 
            type: 'string',
            description: '商品 SKU 篩選'
          },
          status: { 
            type: 'string',
            enum: ['available', 'bound', 'shipped'],
            description: '狀態篩選'
          },
          boxNo: { 
            type: 'string',
            description: '外箱編號篩選'
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
            default: 20,
            description: '每頁筆數 (最多 100)' 
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
                rfids: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rfid: { type: 'string' },
                      sku: { type: 'string' },
                      productNo: { type: 'string' },
                      serialNo: { type: 'string' },
                      status: { type: 'string', enum: ['available', 'bound', 'shipped'] },
                      boxNo: { type: 'string', nullable: true },
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
  }, queryProductRfids);
}

export default rfidRoutes;
