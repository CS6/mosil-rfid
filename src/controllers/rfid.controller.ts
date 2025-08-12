import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateRfidUseCase } from '../application';
import { 
  PrismaProductRfidRepository, 
  PrismaUserRepository,
  PrismaSystemLogRepository
} from '../infrastructure';
import { RfidGenerationService, AuditService } from '../domain';

interface CreateRfidBody {
  sku: string;
  productNo: string;
  serialNo: string;
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