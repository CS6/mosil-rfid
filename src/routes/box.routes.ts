import { FastifyInstance } from 'fastify';
import { createBox, addRfidToBox } from '../controllers/box.controller';

async function boxRoutes(fastify: FastifyInstance) {
  // Create Box
  fastify.post('/box', {
    schema: {
      description: 'Create a new box',
      tags: ['Box'],
      body: {
        type: 'object',
        required: ['userCode'],
        properties: {
          userCode: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 3,
            pattern: '^[A-Z0-9]+$',
            description: 'User code (3 characters, uppercase letters and numbers)'
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
                boxNo: { type: 'string' },
                userCode: { type: 'string' },
                shipmentNo: { type: 'string', nullable: true },
                productCount: { type: 'number' },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, createBox);

  // Add RFID to Box
  fastify.post('/box/add-rfid', {
    schema: {
      description: 'Add RFID tag to a box',
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
            pattern: '^[A-F0-9]+$',
            description: 'RFID tag (17 characters, uppercase hex)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                boxNo: { type: 'string' },
                userCode: { type: 'string' },
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
        }
      }
    }
  }, addRfidToBox);
}

export default boxRoutes;