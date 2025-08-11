import { FastifyInstance } from 'fastify';
import { main } from '../../src/app';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await main();
  
  return app;
}