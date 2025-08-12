import { PrismaClient } from '@prisma/client';
import { User, IUserRepository, UserCode, UserType } from '../../domain';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUuid(uuid: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { uuid }
    });

    return userData ? this.toDomainEntity(userData) : null;
  }

  async findByAccount(account: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { account }
    });

    return userData ? this.toDomainEntity(userData) : null;
  }

  async findByCode(code: UserCode): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { code: code.getValue() }
    });

    return userData ? this.toDomainEntity(userData) : null;
  }

  async save(user: User): Promise<void> {
    const data = {
      uuid: user.getUuid(),
      account: user.getAccount(),
      password: '', // Note: Password should be hashed before saving
      code: user.getCode().getValue(),
      name: user.getName(),
      userType: user.getUserType(),
      isActive: user.getIsActive(),
      lastLoginAt: user.getLastLoginAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt()
    };

    await this.prisma.user.upsert({
      where: { uuid: user.getUuid() },
      create: data,
      update: data
    });
  }

  async delete(uuid: string): Promise<void> {
    await this.prisma.user.delete({
      where: { uuid }
    });
  }

  private toDomainEntity(userData: any): User {
    return new User(
      userData.uuid,
      userData.account,
      userData.password,
      new UserCode(userData.code),
      userData.name,
      userData.userType as UserType,
      userData.isActive,
      userData.lastLoginAt,
      userData.createdAt,
      userData.updatedAt
    );
  }
}