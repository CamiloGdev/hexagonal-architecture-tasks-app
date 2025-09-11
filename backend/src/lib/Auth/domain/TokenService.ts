import type { User } from '../../User/domain/User';

// Define la estructura del payload que irá dentro del token
export interface TokenPayload {
  id: string;
  email: string;
}

// Define el contrato para cualquier servicio que maneje tokens
export interface TokenService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): string;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
}
