import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  CreateShipmentUseCase, 
  AddBoxToShipmentUseCase,
  ShipShipmentUseCase
} from '../application';
import { 
  PrismaShipmentRepository, 
  PrismaBoxRepository,
  PrismaUserRepository,
  PrismaSystemLogRepository
} from '../infrastructure';
import { ShipmentGenerationService, AuditService } from '../domain';

interface CreateShipmentBody {
  userCode: string;
  note?: string;
}

interface AddBoxToShipmentBody {
  shipmentNo: string;
  boxNo: string;
}

interface ShipShipmentBody {
  shipmentNo: string;
}

export async function createShipment(
  request: FastifyRequest<{ Body: CreateShipmentBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const shipmentRepository = new PrismaShipmentRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const shipmentGenerationService = new ShipmentGenerationService(shipmentRepository);
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const createShipmentUseCase = new CreateShipmentUseCase(
      shipmentRepository,
      userRepository,
      shipmentGenerationService,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await createShipmentUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    reply.status(201).send({
      success: true,
      data: result
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function addBoxToShipment(
  request: FastifyRequest<{ Body: AddBoxToShipmentBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const shipmentRepository = new PrismaShipmentRepository(request.server.prisma);
    const boxRepository = new PrismaBoxRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const addBoxToShipmentUseCase = new AddBoxToShipmentUseCase(
      shipmentRepository,
      boxRepository,
      userRepository,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await addBoxToShipmentUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    reply.status(200).send({
      success: true,
      data: result
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function shipShipment(
  request: FastifyRequest<{ Body: ShipShipmentBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const shipmentRepository = new PrismaShipmentRepository(request.server.prisma);
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const shipShipmentUseCase = new ShipShipmentUseCase(
      shipmentRepository,
      userRepository,
      auditService
    );

    const userUuid = 'dummy-user-uuid';
    const ipAddress = request.ip;

    const result = await shipShipmentUseCase.execute(
      request.body,
      userUuid,
      ipAddress
    );

    reply.status(200).send({
      success: true,
      data: result
    });
  } catch (error) {
    reply.status(400).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}