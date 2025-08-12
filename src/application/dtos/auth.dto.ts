export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  uuid: string;
  code: string;
  account: string;
  name: string;
  userType: string;
  accessToken: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string; // Optional, might be in cookie
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}