import { FastifyInstance } from 'fastify';
import { createRfid, batchCreateRfid } from '../controllers/rfid.controller';

async function rfidRoutes(fastify: FastifyInstance) {
  // Create RFID
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
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼 (例: A252600201234)'
          },
          productNo: { 
            type: 'string', 
            minLength: 8, 
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: '貨號 (選填，預設從 SKU 前8碼自動產生) (例: A2526002)'
          },
          serialNo: { 
            type: 'string', 
            minLength: 4, 
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: '流水號 (4位數字) (例: 0001)'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
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
            success: { type: 'boolean' },
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
        }
      }
    }
  }, batchCreateRfid);
}

export default rfidRoutes;