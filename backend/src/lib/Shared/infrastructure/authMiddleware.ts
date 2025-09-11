import type { NextFunction, Request, Response } from 'express';
import {
  InvalidTokenError,
  RefreshTokenNotFoundError,
} from '../../Auth/domain/AuthenticationError';
import { ServiceContainer } from './ServiceContainer';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new RefreshTokenNotFoundError(
        'Authentication required: No token provided.',
      );
    }

    const payload =
      ServiceContainer.auth.tokenService.verifyAccessToken(accessToken);

    if (!payload) {
      throw new InvalidTokenError('Forbidden: Invalid or expired token.');
    }

    // El token es válido. Añadimos el payload a la request para usarlo en los controladores.
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof RefreshTokenNotFoundError) {
      return res.status(401).json({ message: error.message });
    }
    if (error instanceof InvalidTokenError) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};
