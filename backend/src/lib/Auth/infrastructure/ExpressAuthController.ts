import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import type { User } from '../../User/domain/User';
import { UserAlreadyExistsError } from '../../User/domain/UserAlreadyExistsError';
import { UserNotFoundError } from '../../User/domain/UserNotFoundError';
import { UserMapper } from '../../User/infrastructure/dtos/user.mapper';
import {
  InvalidTokenError,
  RefreshTokenNotFoundError,
} from '../domain/AuthenticationError';

export class ExpressAuthController {
  // Helper para obtener la configuración de cookies
  private getCookieConfig(isRefreshToken = false) {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: isProduction, // Solo enviar por HTTPS en producción
      sameSite: 'strict' as const, // 'strict' para mayor seguridad contra CSRF
      maxAge: isRefreshToken
        ? Number(process.env.COOKIE_REFRESH_EXPIRATION) || 7 * 24 * 60 * 60 * 1000 // 7 días
        : Number(process.env.COOKIE_ACCESS_EXPIRATION) || 15 * 60 * 1000, // 15 minutos
      path: isRefreshToken ? '/api/auth/refresh' : '/api', // Ruta específica según el tipo de token
    };
  }

  // Helper para configurar las cookies de forma centralizada
  private setTokenCookies(res: Response, user: User) {
    const accessToken =
      ServiceContainer.auth.tokenService.generateAccessToken(user);
    const refreshToken =
      ServiceContainer.auth.tokenService.generateRefreshToken(user);

    // Cookie del Access Token
    res.cookie('accessToken', accessToken, this.getCookieConfig(false));

    // Cookie del Refresh Token
    res.cookie('refreshToken', refreshToken, this.getCookieConfig(true));
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Los datos ya están validados por el middleware de Zod
      const { name, email, password } = req.body;

      const newUser = await ServiceContainer.auth.register.run(
        name,
        email,
        password,
      );

      // Generar y enviar tokens
      this.setTokenCookies(res, newUser);

      return res.status(201).json({
        message: 'User registered successfully',
        user: UserMapper.toResponseDto(newUser), // Se envía la info del usuario en el body
      });
    } catch (error) {
      console.error('Error registering user:', error);

      if (error instanceof UserAlreadyExistsError) {
        return res.status(409).json({
          message: error.message,
        });
      }

      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Los datos ya están validados por el middleware de Zod
      const { email, password } = req.body;

      const loggedInUser = await ServiceContainer.auth.login.run(
        email,
        password,
      );

      // Generar y enviar tokens
      this.setTokenCookies(res, loggedInUser);

      return res.status(200).json({
        message: 'Login successful',
        user: UserMapper.toResponseDto(loggedInUser), // Se envía la info del usuario en el body
      });
    } catch (error) {
      console.error('Error during login:', error);

      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          message: error.message,
        });
      }

      next(error);
    }
  }

  // Método para refrescar el token
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new RefreshTokenNotFoundError();
      }

      const payload =
        ServiceContainer.auth.tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new InvalidTokenError('Invalid refresh token');
      }

      // El payload es válido, busca al usuario para generar un nuevo token de acceso
      const user = await ServiceContainer.user.getOneById.run(payload.id);

      // Solo necesitamos generar y enviar el nuevo access token
      const accessToken =
        ServiceContainer.auth.tokenService.generateAccessToken(user);
      res.cookie('accessToken', accessToken, this.getCookieConfig(false));

      return res.status(200).json({ message: 'Access token refreshed' });
    } catch (error) {
      if (error instanceof RefreshTokenNotFoundError) {
        return res.status(401).json({ message: error.message });
      }
      if (error instanceof InvalidTokenError) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  // Método para logout - limpia las cookies del cliente
  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implementar la invalidación del token en una blacklist (Redis)

      // Limpiamos las cookies en el navegador del cliente
      res.clearCookie('accessToken', { path: '/api' });
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }
}
