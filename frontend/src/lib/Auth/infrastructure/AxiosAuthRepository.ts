import type {
  AuthRepository,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '../domain/AuthRepository';
import type { AuthUser } from '../domain/User';
import type {
  AuthResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  UserResponseDto,
} from './dtos/auth.dto';
import { authHttpClient } from './http/authHttpClient';
import {
  fromAuthResponseDto,
  fromUserResponseDto,
  toLoginRequestDto,
  toRegisterRequestDto,
} from './mappers/auth.mapper';

export const createAxiosAuthRepository = (): AuthRepository => {
  return {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      const requestDto = toLoginRequestDto(credentials);

      const response = await authHttpClient.post<AuthResponseDto>(
        '/auth/login',
        requestDto,
      );

      return fromAuthResponseDto(response.data);
    },

    async register(data: RegisterData): Promise<AuthResponse> {
      const requestDto = toRegisterRequestDto(data);

      const response = await authHttpClient.post<AuthResponseDto>(
        '/auth/register',
        requestDto,
      );

      return fromAuthResponseDto(response.data);
    },

    async refresh(): Promise<{ message: string }> {
      const response =
        await authHttpClient.post<RefreshResponseDto>('/auth/refresh');

      return {
        message: response.data.message,
      };
    },

    async logout(): Promise<{ message: string }> {
      const response =
        await authHttpClient.post<LogoutResponseDto>('/auth/logout');

      return {
        message: response.data.message,
      };
    },

    async getProfile(): Promise<AuthUser> {
      const response =
        await authHttpClient.get<UserResponseDto>('/auth/profile');

      return fromUserResponseDto(response.data);
    },
  };
};
