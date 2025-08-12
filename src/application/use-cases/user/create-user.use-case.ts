import { IUserRepository, User, UserCode, AuditService } from '../../../domain';
import { CreateUserRequest, UserResponse } from '../../dtos';
import { PasswordUtil } from '../../../infrastructure/utils/password.util';

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: CreateUserRequest,
    createdByUuid: string,
    ipAddress?: string
  ): Promise<UserResponse> {
    // Validate password
    const passwordValidation = PasswordUtil.validate(request.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if account already exists
    const existingUser = await this.userRepository.findByAccount(request.account);
    if (existingUser) {
      throw new Error('Account already exists');
    }

    // Check if code already exists
    const userCode = new UserCode(request.code);
    const existingUserWithCode = await this.userRepository.findByCode(userCode);
    if (existingUserWithCode) {
      throw new Error('User code already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(request.password);

    // Create user
    const user = User.create(
      request.account,
      hashedPassword,
      userCode,
      request.name,
      request.userType
    );

    await this.userRepository.save(user);

    // Log user creation
    await this.auditService.logAction(
      createdByUuid,
      'CREATE_USER',
      'User',
      user.getUuid(),
      `Created user: ${request.account}`,
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