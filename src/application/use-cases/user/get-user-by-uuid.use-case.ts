import { IUserRepository } from '../../../domain';
import { UserResponse } from '../../dtos';

export class GetUserByUuidUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(
    uuid: string,
    requestingUserUuid: string,
    requestingUserType: string
  ): Promise<UserResponse> {
    const user = await this.userRepository.findByUuid(uuid);
    if (!user) {
      throw new Error('User not found');
    }

    // Permission check: suppliers can only view themselves
    if (requestingUserType === 'supplier' && requestingUserUuid !== uuid) {
      throw new Error('Permission denied');
    }

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