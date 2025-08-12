import { FastifyInstance } from 'fastify';
import { createBox, createBatchBoxes, addRfidToBox } from '../controllers/box.controller';

async function boxRoutes(fastify: FastifyInstance) {
  // Create single Box  
  fastify.post('/box', {
    schema: {
      summary: '建立單一外箱標籤',
      description: '建立單一外箱標籤，格式：B + 編號3碼 + 年份4碼 + 流水號5碼 = 13碼',
      tags: ['Box'],
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 3,
            pattern: '^[0-9]+$',
            description: '3位數字編號 (例如: "001")',
            examples: ['001', '002', '123']
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
                boxNo: { type: 'string', description: '箱號 (13碼)', examples: ['B001202500001'] },
                code: { type: 'string', description: '3位編號', examples: ['001'] },
                shipmentNo: { type: 'string', nullable: true },
                productCount: { type: 'number' },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
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
  }, createBox);

  // Create batch Boxes
  fastify.post('/boxes', {
    schema: {
      summary: '批次產生外箱標籤',
      description: '批次產生外箱標籤，格式：B + 編號3碼 + 年份4碼 + 流水號5碼 = 13碼',
      tags: ['Box'],
      body: {
        type: 'object',
        required: ['code', 'quantity'],
        properties: {
          code: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 3,
            pattern: '^[0-9]+$',
            description: '3位數字編號 (例如: "001")',
            examples: ['001', '002', '123']
          },
          quantity: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: '產生數量 (1-100)',
            examples: [10, 50]
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
                code: { 
                  type: 'string', 
                  description: '3位編號',
                  examples: ['001']
                },
                year: { 
                  type: 'string', 
                  description: '年份',
                  examples: ['2025']
                },
                generatedCount: { 
                  type: 'number', 
                  description: '產生的箱號數量',
                  examples: [10]
                },
                boxnos: {
                  type: 'array',
                  description: '產生的箱號列表',
                  items: { 
                    type: 'string',
                    examples: ['B001202500001', 'B001202500002']
                  }
                }
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
  }, createBatchBoxes);

  // Add RFID to Box
  fastify.post('/box/add-rfid', {
    schema: {
      summary: '將 RFID 加入箱子',
      description: '將 RFID 標籤商品加入指定箱子',
      tags: ['Box'],
      body: {
        type: 'object',
        required: ['boxNo', 'rfid'],
        properties: {
          boxNo: { 
            type: 'string', 
            minLength: 13, 
            maxLength: 13,
            description: 'Box number (13 characters)'
          },
          rfid: { 
            type: 'string', 
            minLength: 17, 
            maxLength: 17,
            pattern: '^[A-Z0-9]+$',
            description: 'RFID tag (17 characters, uppercase letters and numbers)'
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
                boxNo: { type: 'string', description: '箱號 (13碼)', examples: ['B001202500001'] },
                code: { type: 'string', description: '3位編號', examples: ['001'] },
                shipmentNo: { type: 'string', nullable: true },
                productCount: { type: 'number' },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                productRfids: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      rfid: { type: 'string' },
                      sku: { type: 'string' },
                      productNo: { type: 'string' },
                      serialNo: { type: 'string' }
                    }
                  }
                }
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
  }, addRfidToBox);
}

export default boxRoutes;