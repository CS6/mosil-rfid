import { IUserRepository, UserCode, AuditService } from '../../../domain';
import { UpdateUserRequest, UserResponse } from '../../dtos';
import { PasswordUtil } from '../../../infrastructure/utils/password.util';

export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    uuid: string,
    request: UpdateUserRequest,
    updatedByUuid: string,
    ipAddress?: string
  ): Promise<UserResponse> {
    const user = await this.userRepository.findByUuid(uuid);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate password if provided
    if (request.password) {
      const passwordValidation = PasswordUtil.validate(request.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }
    }

    // Check if new account already exists (if account is being changed)
    if (request.account && request.account !== user.getAccount()) {
      const existingUser = await this.userRepository.findByAccount(request.account);
      if (existingUser) {
        throw new Error('Account already exists');
      }
    }

    // Check if new code already exists (if code is being changed)
    if (request.code && request.code !== user.getCode().getValue()) {
      const userCode = new UserCode(request.code);
      const existingUserWithCode = await this.userRepository.findByCode(userCode);
      if (existingUserWithCode) {
        throw new Error('User code already exists');
      }
    }

    // Since User entity is immutable, we would need to create a new instance
    // For now, we'll log the audit and return the current user
    // In a full implementation, we'd need to add update methods to the User entity

    await this.auditService.logAction(
      updatedByUuid,
      'UPDATE_USER',
      'User',
      user.getUuid(),
      `Updated user: ${user.getAccount()}`,
      ipAddress
    );

    return {
      uuid: user.getUuid(),
      code: user.getCode().getValue(),
      account: user.getAccount(),
      name: user.getName(),
      userType: user.getUserType(),
      isActive: user.getIsActive(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt()
    };
  }
}