import { IUserRepository, AuditService } from '../../../domain';

export class DeleteUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    uuid: string,
    deletedByUuid: string,
    ipAddress?: string
  ): Promise<void> {
    const user = await this.userRepository.findByUuid(uuid);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-deletion
    if (uuid === deletedByUuid) {
      throw new Error('Cannot delete your own account');
    }

    await this.userRepository.delete(uuid);

    await this.auditService.logAction(
      deletedByUuid,
      'DELETE_USER',
      'User',
      uuid,
      `Deleted user: ${user.getAccount()}`,
      ipAddress
    );
  }
}