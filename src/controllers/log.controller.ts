import { FastifyRequest, FastifyReply } from 'fastify';
import { QueryLogsUseCase } from '../application/use-cases/logs/query-logs.use-case';
import { GetLogSummaryUseCase } from '../application/use-cases/logs/get-log-summary.use-case';
import { PrismaSystemLogRepository } from '../infrastructure';
import { ApiSuccessResponse } from '../types/api-response';

interface LogQueryParams {
  userUuid?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function queryLogs(
  request: FastifyRequest<{ Querystring: LogQueryParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize use case
    const queryLogsUseCase = new QueryLogsUseCase(systemLogRepository);

    const result = await queryLogsUseCase.execute(request.query);

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}

export async function getLogSummary(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Initialize repositories
    const systemLogRepository = new PrismaSystemLogRepository(request.server.prisma);

    // Initialize use case
    const getLogSummaryUseCase = new GetLogSummaryUseCase(systemLogRepository);

    const result = await getLogSummaryUseCase.execute();

    const response: ApiSuccessResponse = {
      message: "success",
      data: result
    };
    
    reply.status(200).send(response);
  } catch (error) {
    throw error; // Let global error handler handle it
  }
}