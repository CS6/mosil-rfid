import { FastifyInstance } from 'fastify';
import rfidRoutes from './rfid.routes';
import boxRoutes from './box.routes';
import shipmentRoutes from './shipment.routes';

export default async function apiRoutes(fastify: FastifyInstance) {
  // Register RFID system routes
  fastify.register(rfidRoutes);
  fastify.register(boxRoutes);
  fastify.register(shipmentRoutes);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}