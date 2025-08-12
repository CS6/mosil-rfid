import { FastifyInstance } from 'fastify';
import { createShipment, addBoxToShipment, shipShipment } from '../controllers/shipment.controller';

async function shipmentRoutes(fastify: FastifyInstance) {
  // Create Shipment
  fastify.post('/shipment', {
    schema: {
      summary: '建立新出貨單',
      description: '建立新的出貨單以管理多個箱子',
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
            message: { type: 'string', enum: ['success'] },
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
  }, createShipment);

  // Add Box to Shipment
  fastify.post('/shipment/add-box', {
    schema: {
      summary: '將箱子加入出貨單',
      description: '將已裝箱的商品加入出貨單',
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
            message: { type: 'string', enum: ['success'] },
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
                      createdAt: { type: 'string', format: 'date-time' }
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
        },
        404: {
          $ref: 'errorResponseSchema#'
        }
      }
    }
  }, addBoxToShipment);

  // Ship Shipment
  fastify.post('/shipment/ship', {
    schema: {
      summary: '出貨',
      description: '將出貨單狀態變更為已出貨（不可再修改）',
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
            message: { type: 'string', enum: ['success'] },
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
        },
        400: {
          $ref: 'errorResponseSchema#'
        },
        401: {
          $ref: 'unauthorizedResponseSchema#'
        },
        403: {
          $ref: 'forbiddenResponseSchema#'
        },
        404: {
          $ref: 'errorResponseSchema#'
        }
      }
    }
  }, shipShipment);
}

export default shipmentRoutes;