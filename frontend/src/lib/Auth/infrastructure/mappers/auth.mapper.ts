import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '../../domain/AuthRepository';
import type { AuthUser } from '../../domain/User';
import type {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserResponseDto,
} from '../dtos/auth.dto';

// Map domain User to API UserResponseDto
export const toUserResponseDto = (user: AuthUser): UserResponseDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

// Map API UserResponseDto to domain User
export const fromUserResponseDto = (dto: UserResponseDto): AuthUser => {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
};

// Map API AuthResponseDto to domain AuthResponse
export const fromAuthResponseDto = (dto: AuthResponseDto): AuthResponse => {
  return {
    message: dto.message,
    user: fromUserResponseDto(dto.user),
  };
};

// Map domain LoginCredentials to API LoginRequestDto
export const toLoginRequestDto = (
  credentials: LoginCredentials,
): LoginRequestDto => {
  return {
    email: credentials.email,
    password: credentials.password,
  };
};

// Map domain RegisterData to API RegisterRequestDto
export const toRegisterRequestDto = (
  data: RegisterData,
): RegisterRequestDto => {
  return {
    name: data.name,
    email: data.email,
    password: data.password,
  };
};
