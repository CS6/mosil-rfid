import { IUserRepository, User } from '../../../domain';
import { UserListQuery, UserListResponse } from '../../dtos';

export class GetUsersUseCase {
  // @ts-ignore: userRepository will be used when repository methods are implemented
  constructor(private userRepository: IUserRepository) {}

  public async execute(query: UserListQuery): Promise<UserListResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100); // Max 100 items per page

    // This would need to be implemented in the repository
    // For now, we'll return a basic structure with proper typing
    const users: User[] = []; // Would get from repository with filters
    const total = 0; // Would get total count from repository

    return {
      users: users.map(user => ({
        uuid: user.getUuid(),
        code: user.getCode().getValue(),
        account: user.getAccount(),
        name: user.getName(),
        userType: user.getUserType(),
        isActive: user.getIsActive(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt()
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}