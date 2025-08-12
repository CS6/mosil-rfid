import { PrismaClient } from '@prisma/client';
import { SystemLog, ISystemLogRepository } from '../../domain';

export class PrismaSystemLogRepository implements ISystemLogRepository {
  constructor(private prisma: PrismaClient) {}

  async save(log: SystemLog): Promise<void> {
    await this.prisma.systemLog.create({
      data: {
        userUuid: log.getUserUuid(),
        action: log.getAction(),
        targetType: log.getTargetType(),
        targetId: log.getTargetId(),
        description: log.getDescription(),
        ipAddress: log.getIpAddress(),
        createdAt: log.getCreatedAt()
      }
    });
  }

  async findByUserUuid(userUuid: string): Promise<SystemLog[]> {
    const logData = await this.prisma.systemLog.findMany({
      where: { userUuid },
      orderBy: { createdAt: 'desc' }
    });

    return logData.map(data => this.toDomainEntity(data));
  }

  async findByAction(action: string): Promise<SystemLog[]> {
    const logData = await this.prisma.systemLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' }
    });

    return logData.map(data => this.toDomainEntity(data));
  }

  private toDomainEntity(logData: any): SystemLog {
    return new SystemLog(
      logData.id,
      logData.userUuid,
      logData.action,
      logData.targetType,
      logData.targetId,
      logData.description,
      logData.ipAddress,
      logData.createdAt
    );
  }
}