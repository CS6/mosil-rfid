import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBoxUseCase, CreateBatchBoxesUseCase, AddRfidToBoxUseCase, RemoveRfidFromBoxUseCase } from '../application';
import { 
  PrismaBoxRepository, 
  PrismaUserRepository,
  PrismaSystemLogRepository,
  PrismaProductRfidRepository
} from '../infrastructure';
import { BoxGenerationService, AuditService } from '../domain';
import { ApiSuccessResponse } from '../types/api-response';

interface CreateBoxBody {
  code: string; // 3位編號
}

interface CreateBatchBoxBody {
  code: string; // 3位編號
  quantity: number; // 數量
}

interface AddRfidToBoxBody {
  boxNo: string;
  rfid: string;
}

interface RemoveRfidFromBoxBody {
  boxNo: string;
  rfid: string;
}

interface GetBoxesQuery {
  page?: number;
  limit?: number;
  shipmentNo?: string;
  status?: 'CREATED' | 'PACKED' | 'SHIPPED';
}

interface GetBoxParams {
  boxNo: string;
}

export async function createBox(
  request: FastifyRequest<{ Body: CreateBoxBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const boxRepository = new PrismaBoxRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const boxGenerationService = new BoxGenerationService(boxRepository);
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const createBoxUseCase = new CreateBoxUseCase(
      boxRepository,
      userRepository,
      boxGenerationService,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await createBoxUseCase.execute(
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

export async function addRfidToBox(
  request: FastifyRequest<{ Body: AddRfidToBoxBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const boxRepository = new PrismaBoxRepository(request.server.prisma);
    const productRfidRepository = new PrismaProductRfidRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const addRfidToBoxUseCase = new AddRfidToBoxUseCase(
      boxRepository,
      productRfidRepository,
      userRepository,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await addRfidToBoxUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}

export async function createBatchBoxes(
  request: FastifyRequest<{ Body: CreateBatchBoxBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const boxRepository = new PrismaBoxRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const boxGenerationService = new BoxGenerationService(boxRepository);
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const createBatchBoxesUseCase = new CreateBatchBoxesUseCase(
      boxRepository,
      userRepository,
      boxGenerationService,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await createBatchBoxesUseCase.execute(
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
export async function removeRfidFromBox(
  request: FastifyRequest<{ Body: RemoveRfidFromBoxBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const boxRepository = new PrismaBoxRepository(request.server.prisma);
    const productRfidRepository = new PrismaProductRfidRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const removeRfidFromBoxUseCase = new RemoveRfidFromBoxUseCase(
      boxRepository,
      productRfidRepository,
      userRepository,
      auditService
    );

    const userUuid = "dummy-user-uuid";
    const ipAddress = request.ip;

    const result = await removeRfidFromBoxUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}


export async function getBoxes(
  request: FastifyRequest<{ Querystring: GetBoxesQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // @ts-ignore: shipmentNo and status will be used when repository methods are implemented
    const { page = 1, limit = 50, shipmentNo, status } = request.query;
    
    const response: ApiSuccessResponse = {
      message: "success",
      data: {
        boxes: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      }
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error;
  }
}

export async function getBoxByNo(
  request: FastifyRequest<{ Params: GetBoxParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { boxNo } = request.params;
    
    const response: ApiSuccessResponse = {
      message: "success",
      data: {
        boxNo,
        code: boxNo.substring(1, 4),
        shipmentNo: null,
        productCount: 0,
        status: 'CREATED',
        productRfids: [],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error;
  }
}
