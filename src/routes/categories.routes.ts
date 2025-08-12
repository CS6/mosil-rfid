import { FastifyInstance } from 'fastify';
import rfidRoutes from './rfid.routes';
import boxRoutes from './box.routes';
import shipmentRoutes from './shipment.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import logRoutes from './log.routes';

export default async function apiRoutes(fastify: FastifyInstance) {
  // Register authentication routes
  fastify.register(authRoutes, { prefix: '/auth' });
  
  // Register user management routes
  fastify.register(userRoutes, { prefix: '/users' });
  
  // Register system logs routes
  fastify.register(logRoutes, { prefix: '/logs' });
  
  // Register RFID system routes
  fastify.register(rfidRoutes);
  fastify.register(boxRoutes);
  fastify.register(shipmentRoutes);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}