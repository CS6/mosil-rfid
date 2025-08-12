import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateRfidUseCase, BatchCreateRfidUseCase } from '../application';
import {
  PrismaProductRfidRepository,
  PrismaUserRepository,
  PrismaSystemLogRepository
} from '../infrastructure';
import { RfidGenerationService, AuditService } from '../domain';
import { ApiSuccessResponse } from '../types/api-response';

interface CreateRfidBody {
  sku: string;
  productNo?: string;
  serialNo: string;
}

interface BatchCreateRfidBody {
  sku: string;
  productNo?: string;
  startSerialNo: string;
  quantity: number;
}

export async function createRfid(
  request: FastifyRequest<{ Body: CreateRfidBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const productRfidRepository = new PrismaProductRfidRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const rfidGenerationService = new RfidGenerationService(productRfidRepository);
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const createRfidUseCase = new CreateRfidUseCase(
      productRfidRepository,
      userRepository,
      rfidGenerationService,
      auditService
    );

    // For now, we'll use a dummy user UUID - in a real app this would come from authentication
    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await createRfidUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(201).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}

export async function batchCreateRfid(
  request: FastifyRequest<{ Body: BatchCreateRfidBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const productRfidRepository = new PrismaProductRfidRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const rfidGenerationService = new RfidGenerationService(productRfidRepository);
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const batchCreateRfidUseCase = new BatchCreateRfidUseCase(
      productRfidRepository,
      userRepository,
      rfidGenerationService,
      auditService
    );

    // For now, we'll use a dummy user UUID - in a real app this would come from authentication
    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await batchCreateRfidUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(201).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}
