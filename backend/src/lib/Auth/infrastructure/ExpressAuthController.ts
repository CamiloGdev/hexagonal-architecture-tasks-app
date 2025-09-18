import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import type { User } from '../../User/domain/User';
import { UserAlreadyExistsError } from '../../User/domain/UserAlreadyExistsError';
import { UserNotFoundError } from '../../User/domain/UserNotFoundError';
import { UserMapper } from '../../User/infrastructure/dtos/user.mapper';
import {
  AuthenticationError,
  InvalidTokenError,
  RefreshTokenNotFoundError,
} from '../domain/AuthenticationError';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de sesiones de usuario
 */
export class ExpressAuthController {
  // Helper para obtener la configuración de cookies
  private getCookieConfig(isRefreshToken = false) {
    return {
      httpOnly: true, // No accesible desde JavaScript del cliente
      secure: isProduction, // Solo enviar por HTTPS en producción
      sameSite: isProduction ? ('none' as const) : ('lax' as const), // 'lax' en desarrollo, 'none' en producción
      // sameSite: 'strict' as const, // 'strict' para mayor seguridad contra CSRF
      maxAge: isRefreshToken
        ? Number(process.env.COOKIE_REFRESH_EXPIRATION) ||
          7 * 24 * 60 * 60 * 1000 // 7 días
        : Number(process.env.COOKIE_ACCESS_EXPIRATION) || 15 * 60 * 1000, // 15 minutos
      path: isProduction
        ? isRefreshToken
          ? '/api/auth/refresh'
          : '/api'
        : '/', // Ruta específica según el tipo de token, en desarrollo todas las rutas
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

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registrar un nuevo usuario
   *     description: Crea una nueva cuenta de usuario con validación completa de datos y genera tokens de autenticación
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *         headers:
   *           Set-Cookie:
   *             description: Cookies de autenticación (accessToken y refreshToken)
   *             schema:
   *               type: string
   *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthSuccessResponse'
   *             example:
   *               message: "User registered successfully"
   *               user:
   *                 id: "123e4567-e89b-12d3-a456-426614174000"
   *                 name: "Juan Pérez"
   *                 email: "juan.perez@example.com"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *             example:
   *               error: "Invalid request data"
   *               details:
   *                 - field: "body.name"
   *                   message: "body.name must be at least 3 characters long"
   *                 - field: "body.password"
   *                   message: "body.password La contraseña debe contener al menos una letra mayúscula"
   *       409:
   *         description: El usuario ya existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ConflictErrorResponse'
   *             example:
   *               message: "User already exists"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
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

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Iniciar sesión de usuario
   *     description: Autentica un usuario existente con email y contraseña, genera tokens de autenticación
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Inicio de sesión exitoso
   *         headers:
   *           Set-Cookie:
   *             description: Cookies de autenticación (accessToken y refreshToken)
   *             schema:
   *               type: string
   *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthSuccessResponse'
   *             example:
   *               message: "Login successful"
   *               user:
   *                 id: "123e4567-e89b-12d3-a456-426614174000"
   *                 name: "Juan Pérez"
   *                 email: "juan.perez@example.com"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *             example:
   *               error: "Invalid request data"
   *               details:
   *                 - field: "body.email"
   *                   message: "body.email must be a valid email address"
   *                 - field: "body.password"
   *                   message: "body.password is required"
   *       404:
   *         description: Usuario no encontrado o credenciales incorrectas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "User not found"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
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

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Refrescar token de acceso
   *     description: Genera un nuevo token de acceso usando el refresh token almacenado en cookies
   *     tags: [Auth]
   *     parameters:
   *       - in: cookie
   *         name: refreshToken
   *         required: true
   *         schema:
   *           type: string
   *         description: Token de refresco almacenado en cookie HttpOnly
   *     responses:
   *       200:
   *         description: Token de acceso renovado exitosamente
   *         headers:
   *           Set-Cookie:
   *             description: Nueva cookie de accessToken
   *             schema:
   *               type: string
   *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RefreshSuccessResponse'
   *             example:
   *               message: "Access token refreshed"
   *       401:
   *         description: Token de refresco no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *             example:
   *               message: "Refresh token not found"
   *       403:
   *         description: Token de refresco inválido o expirado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ForbiddenErrorResponse'
   *             example:
   *               message: "Invalid refresh token"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
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

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Cerrar sesión de usuario
   *     description: Cierra la sesión del usuario eliminando las cookies de autenticación del navegador
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Sesión cerrada exitosamente
   *         headers:
   *           Set-Cookie:
   *             description: Cookies de autenticación eliminadas
   *             schema:
   *               type: string
   *               example: accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LogoutSuccessResponse'
   *             example:
   *               message: "Logout successful"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  // Método para logout - limpia las cookies del cliente
  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implementar la invalidación del token en una blacklist (Redis)

      // Limpiamos las cookies en el navegador del cliente
      res.clearCookie('accessToken', { path: isProduction ? '/api' : '/' });
      res.clearCookie('refreshToken', {
        path: isProduction ? '/api/auth/refresh' : '/',
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     summary: Obtener perfil del usuario autenticado
   *     description: Devuelve la información del usuario basado en el token de acceso almacenado en cookies
   *     tags: [Auth]
   *     security:
   *       - cookieAuth: []
   *     responses:
   *       200:
   *         description: Perfil del usuario obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponseDto'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Juan Pérez"
   *               email: "juan.perez@example.com"
   *               createdAt: "2024-01-01T00:00:00.000Z"
   *               updatedAt: "2024-01-01T00:00:00.000Z"
   *       401:
   *         description: Token de acceso no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *             example:
   *               message: "Authentication required: No token provided."
   *       403:
   *         description: Token de acceso inválido o expirado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ForbiddenErrorResponse'
   *             example:
   *               message: "Forbidden: Invalid or expired token."
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "User not found"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user es añadido por el authMiddleware y contiene el payload del token (id, email)
      if (!req.user) {
        throw new AuthenticationError('No user found in token payload');
      }

      const userId = req.user.id;
      const user = await ServiceContainer.user.getOneById.run(userId);

      return res.status(200).json(UserMapper.toResponseDto(user));
    } catch (error) {
      console.error('Error getting user profile:', error);

      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error instanceof AuthenticationError) {
        return res.status(401).json({
          message: error.message,
        });
      }

      next(error);
    }
  }
}
