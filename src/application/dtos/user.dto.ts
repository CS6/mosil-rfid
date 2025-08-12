export interface CreateUserRequest {
  account: string;
  password: string;
  code: string;
  name: string;
  userType: 'admin' | 'user' | 'supplier';
}

export interface UpdateUserRequest {
  account?: string;
  password?: string;
  code?: string;
  name?: string;
  userType?: 'admin' | 'user' | 'supplier';
  isActive?: boolean;
}

export interface UserResponse {
  uuid: string;
  code: string;
  account: string;
  name: string;
  userType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  userType?: string;
  code?: string;
}

export interface UserListResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}