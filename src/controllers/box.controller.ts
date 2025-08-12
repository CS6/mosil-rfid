import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBoxUseCase, AddRfidToBoxUseCase } from '../application';
import { 
  PrismaBoxRepository, 
  PrismaUserRepository,
  PrismaSystemLogRepository,
  PrismaProductRfidRepository
} from '../infrastructure';
import { BoxGenerationService, AuditService } from '../domain';

interface CreateBoxBody {
  userCode: string;
}

interface AddRfidToBoxBody {
  boxNo: string;
  rfid: string;
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