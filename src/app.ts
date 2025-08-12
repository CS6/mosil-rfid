import fastify from 'fastify'
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';

import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import envConfig from './lib/env.config';
import corsConfig from './config/cors.config';
import loggerConfig from './config/logger.config';
import compressConfig from './config/compress.config';
import prismaPlugin from './plugins/prisma.plugin';
import helmetConfig from './config/helmet.config';
import { swaggerConfig } from './config/swagger.config';
import { setupErrorHandler } from './middleware/error-handler';

import apiRoutes from './routes/categories.routes'; // This now contains our RFID system routes
import { messageSchema, paramIdSchema, paginationSchema, errorResponseSchema, unauthorizedResponseSchema, forbiddenResponseSchema } from './schema/common.schema';

const main = async () => {
  const app = fastify({ logger: loggerConfig });

  // Now we setup our app, plugins and such
  await app.register(fastifyEnv, envConfig);
  await app.register(fastifyCors, corsConfig);
  await app.register(fastifyCompress, compressConfig);
  await app.register(fastifyHelmet, helmetConfig);
  await app.register(prismaPlugin);

  // Json Schemas
  app.addSchema(paginationSchema);
  app.addSchema(paramIdSchema);
  app.addSchema(messageSchema);
  app.addSchema(errorResponseSchema);
  app.addSchema(unauthorizedResponseSchema);
  app.addSchema(forbiddenResponseSchema);

  // Swagger Docs
  if (app.config.ENABLE_SWAGGER) {
    await app.register(fastifySwagger, swaggerConfig);
    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  // Setup error handling
  setupErrorHandler(app);

  // API Endpoint routes
  await app.register(apiRoutes, { prefix: "/api/v1" });

  return app;
};

export { main };

