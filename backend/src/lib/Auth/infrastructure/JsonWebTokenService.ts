import jwt from 'jsonwebtoken';
import type { User } from '../../User/domain/User';
import type { TokenPayload, TokenService } from '../domain/TokenService';

export class JsonWebTokenService implements TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;

  constructor() {
    this.accessSecret =
      process.env.JWT_ACCESS_SECRET || 'default_access_secret';
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
    this.accessExpiration = process.env.JWT_ACCESS_EXPIRATION || '15m';
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

    if (
      this.accessSecret === 'default_access_secret' ||
      this.refreshSecret === 'default_refresh_secret'
    ) {
      console.warn(
        'ADVERTENCIA: Usando secretos JWT por defecto. Configura las variables de entorno JWT_ACCESS_SECRET y JWT_REFRESH_SECRET en producción.',
      );
    }
  }

  private generateToken(user: User, secret: string, expiresIn: string): string {
    if (!user.id || !user.email) {
      throw new Error(
        'El usuario debe tener ID y email para generar un token.',
      );
    }

    const payload: TokenPayload = {
      id: user.id.value,
      email: user.email.value,
    };

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  private verifyToken(token: string, secret: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded as TokenPayload;
    } catch {
      // Si el token es inválido (expirado, malformado, etc.), jwt.verify lanza un error.
      return null;
    }
  }

  public generateAccessToken(user: User): string {
    return this.generateToken(user, this.accessSecret, this.accessExpiration);
  }

  public generateRefreshToken(user: User): string {
    return this.generateToken(user, this.refreshSecret, this.refreshExpiration);
  }

  public verifyAccessToken(token: string): TokenPayload | null {
    return this.verifyToken(token, this.accessSecret);
  }

  public verifyRefreshToken(token: string): TokenPayload | null {
    return this.verifyToken(token, this.refreshSecret);
  }
}
