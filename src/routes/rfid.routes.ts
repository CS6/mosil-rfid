import { FastifyInstance } from 'fastify';
import { createRfid } from '../controllers/rfid.controller';

async function rfidRoutes(fastify: FastifyInstance) {
  // Create RFID
  fastify.post('/rfid', {
    schema: {
      description: 'Create a new RFID tag',
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
            description: 'SKU (13 characters, uppercase letters and numbers)'
          },
          productNo: { 
            type: 'string', 
            minLength: 8, 
            maxLength: 8,
            pattern: '^[A-Z0-9]+$',
            description: 'Product number (8 characters, uppercase letters and numbers)'
          },
          serialNo: { 
            type: 'string', 
            minLength: 4, 
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: 'Serial number (4 digits)'
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
}

export default rfidRoutes;