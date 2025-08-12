import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginUseCase, RefreshTokenUseCase } from '../application';
import { 
  PrismaUserRepository,
  PrismaSystemLogRepository
} from '../infrastructure';
import { AuditService } from '../domain';
import { ApiSuccessResponse } from '../types/api-response';

interface LoginBody {
  account: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken?: string;
}

export async function login(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const loginUseCase = new LoginUseCase(userRepository, auditService);

    const ipAddress = request.ip;

    const result = await loginUseCase.execute(request.body, ipAddress);

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}

export async function refreshToken(
  request: FastifyRequest<{ Body: RefreshTokenBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);

    // Initialize use case
    const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);

    const result = await refreshTokenUseCase.execute(request.body);

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}