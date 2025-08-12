import { ISystemLogRepository, SystemLog } from '../../../domain';
import { LogQuery, LogResponse, LogItem } from '../../dtos';

export class QueryLogsUseCase {
  // @ts-ignore: systemLogRepository will be used when repository methods are implemented
  constructor(private systemLogRepository: ISystemLogRepository) {}

  public async execute(query: LogQuery): Promise<LogResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100); // Max 100 items per page

    // This would need to be implemented in the repository with proper filtering
    // For now, we'll return a basic structure with proper typing
    const logs: SystemLog[] = []; // Would get from repository with filters
    const total = 0; // Would get total count from repository

    // Map SystemLog entities to LogItem DTOs
    const logItems: LogItem[] = logs.map(log => ({
      id: log.getId().toString(), // Convert bigint to string
      userUuid: log.getUserUuid(),
      userName: undefined, // Would need to join with User table
      action: log.getAction(),
      targetType: log.getTargetType(),
      targetId: log.getTargetId(),
      description: log.getDescription(),
      ipAddress: log.getIpAddress(),
      createdAt: log.getCreatedAt()
    }));

    return {
      logs: logItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}