import { IUserRepository } from '../../../domain';
import { RefreshTokenRequest, RefreshTokenResponse } from '../../dtos';
import { JwtUtil } from '../../../infrastructure/utils/jwt.util';

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    if (!request.refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      const decoded = JwtUtil.verifyRefreshToken(request.refreshToken);
      
      const user = await this.userRepository.findByUuid(decoded.uuid);
      if (!user || !user.getIsActive()) {
        throw new Error('User not found or inactive');
      }

      const tokenPayload = {
        uuid: user.getUuid(),
        account: user.getAccount(),
        userType: user.getUserType(),
        code: user.getCode().getValue()
      };

      const tokens = JwtUtil.generateTokenPair(tokenPayload);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}