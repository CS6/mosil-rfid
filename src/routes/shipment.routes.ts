import { FastifyInstance } from 'fastify';
import { createShipment, addBoxToShipment, shipShipment } from '../controllers/shipment.controller';

async function shipmentRoutes(fastify: FastifyInstance) {
  // Create Shipment
  fastify.post('/shipment', {
    schema: {
      description: 'Create a new shipment',
      tags: ['Shipment'],
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
          },
          note: { 
            type: 'string', 
            description: 'Optional note for the shipment'
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
                shipmentNo: { type: 'string' },
                userCode: { type: 'string' },
                boxCount: { type: 'number' },
                status: { type: 'string', enum: ['CREATED', 'SHIPPED'] },
                note: { type: 'string', nullable: true },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, createShipment);

  // Add Box to Shipment
  fastify.post('/shipment/add-box', {
    schema: {
      description: 'Add box to a shipment',
      tags: ['Shipment'],
      body: {
        type: 'object',
        required: ['shipmentNo', 'boxNo'],
        properties: {
          shipmentNo: { 
            type: 'string', 
            minLength: 16, 
            maxLength: 16,
            description: 'Shipment number (16 characters)'
          },
          boxNo: { 
            type: 'string', 
            minLength: 13, 
            maxLength: 13,
            description: 'Box number (13 characters)'
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
                shipmentNo: { type: 'string' },
                userCode: { type: 'string' },
                boxCount: { type: 'number' },
                status: { type: 'string', enum: ['CREATED', 'SHIPPED'] },
                note: { type: 'string', nullable: true },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                boxes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      boxNo: { type: 'string' },
                      productCount: { type: 'number' },
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
  }, addBoxToShipment);

  // Ship Shipment
  fastify.post('/shipment/ship', {
    schema: {
      description: 'Ship a shipment',
      tags: ['Shipment'],
      body: {
        type: 'object',
        required: ['shipmentNo'],
        properties: {
          shipmentNo: { 
            type: 'string', 
            minLength: 16, 
            maxLength: 16,
            description: 'Shipment number (16 characters)'
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
                shipmentNo: { type: 'string' },
                userCode: { type: 'string' },
                boxCount: { type: 'number' },
                status: { type: 'string', enum: ['CREATED', 'SHIPPED'] },
                note: { type: 'string', nullable: true },
                createdBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  }, shipShipment);
}

export default shipmentRoutes;