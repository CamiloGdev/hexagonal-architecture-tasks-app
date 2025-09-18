// Domain exports

// Application exports
export { AUTH_QUERY_KEYS, createAuthService } from './application/AuthService';
export {
  AuthError,
  ConflictError,
} from './domain/AuthError';

export type {
  AuthRepository,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from './domain/AuthRepository';

export type { AuthUser, User } from './domain/User';
export {
  ensureEmailIsValid,
  ensureNameIsValid,
  ensurePasswordIsValid,
  ensureUserIsValid,
  isValidEmail,
  isValidName,
  isValidPassword,
} from './domain/User';

// Infrastructure exports
export { createAxiosAuthRepository } from './infrastructure/AxiosAuthRepository';
// DTOs and mappers
export type {
  ApiErrorDto,
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserResponseDto,
} from './infrastructure/dtos/auth.dto';
export {
  fromAuthResponseDto,
  fromUserResponseDto,
  toLoginRequestDto,
  toRegisterRequestDto,
  toUserResponseDto,
} from './infrastructure/mappers/auth.mapper';
export type {
  LoginFormData,
  RegisterFormData,
} from './infrastructure/validation/auth.schemas';
// Validation schemas
export {
  loginSchema,
  registerSchema,
} from './infrastructure/validation/auth.schemas';
