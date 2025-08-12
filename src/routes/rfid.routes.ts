import { FastifyInstance } from 'fastify';
import { createRfid, batchCreateRfid } from '../controllers/rfid.controller';

async function rfidRoutes(fastify: FastifyInstance) {
  // Create RFID
  fastify.post('/rfid', {
    schema: {
      description: 'Create a new RFID tag (SKU + SerialNo = 17碼 RFID)',
      tags: ['RFID'],
      body: {
        type: 'object',
        required: ['sku', 'productNo', 'serialNo'],
        properties: {
          sku: { 
            type: 'string', 
            minLength: 13, 
            maxLength: 13,
            pattern: '^[A-Z0-9]+$',
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼'
          },
          productNo: { 
            type: 'string', 
            minLength: 8, 
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: '貨號 (必須等於 SKU 前8碼)'
          },
          serialNo: { 
            type: 'string', 
            minLength: 4, 
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: '流水號 (4位數字)'
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
      description: '批次產生 RFID 標籤',
      tags: ['RFID'],
      body: {
        type: 'object',
        required: ['sku', 'productNo', 'startSerialNo', 'quantity'],
        properties: {
          sku: { 
            type: 'string', 
            minLength: 13, 
            maxLength: 13,
            pattern: '^[A-Z0-9]+$',
            description: 'SKU = 貨號(8) + 顏色(3) + 尺寸(2) = 13碼'
          },
          productNo: { 
            type: 'string', 
            minLength: 8, 
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: '貨號 (必須等於 SKU 前8碼)'
          },
          startSerialNo: { 
            type: 'string', 
            minLength: 4, 
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: '起始流水號 (4位數字)'
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 1000,
            description: '要產生的數量 (1-1000)'
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