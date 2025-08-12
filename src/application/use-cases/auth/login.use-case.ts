import { IUserRepository, AuditService } from '../../../domain';
import { LoginRequest, LoginResponse } from '../../dtos';
import { PasswordUtil } from '../../../infrastructure/utils/password.util';
import { JwtUtil } from '../../../infrastructure/utils/jwt.util';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: LoginRequest,
    ipAddress?: string
  ): Promise<LoginResponse> {
    const user = await this.userRepository.findByAccount(request.account);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.getIsActive()) {
      throw new Error('Account is disabled');
    }

    const isPasswordValid = await PasswordUtil.compare(
      request.password,
      user.getPasswordHash()
    );

    if (!isPasswordValid) {
      await this.auditService.logAction(
        user.getUuid(),
        'LOGIN_FAILED',
        'User',
        user.getUuid(),
        'Invalid password attempt',
        ipAddress
      );
      throw new Error('Invalid credentials');
    }

    const tokenPayload = {
      uuid: user.getUuid(),
      account: user.getAccount(),
      userType: user.getUserType(),
      code: user.getCode().getValue()
    };

    const tokens = JwtUtil.generateTokenPair(tokenPayload);

    await this.auditService.logAction(
      user.getUuid(),
      'LOGIN_SUCCESS',
      'User',
      user.getUuid(),
      'Successful login',
      ipAddress
    );

    return {
      uuid: user.getUuid(),
      code: user.getCode().getValue(),
      account: user.getAccount(),
      name: user.getName(),
      userType: user.getUserType(),
      accessToken: tokens.accessToken
    };
  }
}