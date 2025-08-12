import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserUseCase, GetUsersUseCase, GetUserByUuidUseCase, UpdateUserUseCase, DeleteUserUseCase } from '../application';
import { 
  PrismaUserRepository,
  PrismaSystemLogRepository
} from '../infrastructure';
import { AuditService } from '../domain';
import { ApiSuccessResponse } from '../types/api-response';

interface CreateUserBody {
  account: string;
  password: string;
  code: string;
  name: string;
  userType: 'admin' | 'user' | 'supplier';
}

interface GetUsersQuery {
  page?: number;
  limit?: number;
  userType?: string;
  code?: string;
}

interface GetUserParams {
  uuid: string;
}

interface UpdateUserBody {
  account?: string;
  password?: string;
  code?: string;
  name?: string;
  userType?: 'admin' | 'user' | 'supplier';
  isActive?: boolean;
}

interface UpdateUserParams {
  uuid: string;
}

interface DeleteUserParams {
  uuid: string;
}

export async function createUser(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const createUserUseCase = new CreateUserUseCase(userRepository, auditService);

    const createdByUuid = 'dummy-user-uuid'; // Would get from JWT token
    const ipAddress = request.ip;

    const result = await createUserUseCase.execute(
      request.body,
      createdByUuid,
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

export async function getUsers(
  request: FastifyRequest<{ Querystring: GetUsersQuery }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);

    // Initialize use case
    const getUsersUseCase = new GetUsersUseCase(userRepository);

    const result = await getUsersUseCase.execute(request.query);

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}

export async function getUserByUuid(
  request: FastifyRequest<{ Params: GetUserParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);

    // Initialize use case
    const getUserByUuidUseCase = new GetUserByUuidUseCase(userRepository);

    const requestingUserUuid = 'dummy-user-uuid'; // Would get from JWT token
    const requestingUserType = 'admin'; // Would get from JWT token

    const result = await getUserByUuidUseCase.execute(
      request.params.uuid,
      requestingUserUuid,
      requestingUserType
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
export async function updateUser(
  request: FastifyRequest<{ Params: UpdateUserParams; Body: UpdateUserBody }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const updateUserUseCase = new UpdateUserUseCase(userRepository, auditService);

    const updatedByUuid = "dummy-user-uuid"; // Would get from JWT token
    const ipAddress = request.ip;

    const result = await updateUserUseCase.execute(
      request.params.uuid,
      request.body,
      updatedByUuid,
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

export async function deleteUser(
  request: FastifyRequest<{ Params: DeleteUserParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const userRepository = new PrismaUserRepository(request.server.prisma);
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize services
    const auditService = new AuditService(systemLogRepository);

    // Initialize use case
    const deleteUserUseCase = new DeleteUserUseCase(userRepository, auditService);

    const deletedByUuid = "dummy-user-uuid"; // Would get from JWT token
    const ipAddress = request.ip;

    await deleteUserUseCase.execute(
      request.params.uuid,
      deletedByUuid,
      ipAddress
    );

    const response: ApiSuccessResponse = {
      message: "success",
      data: null
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}
