import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { UserAlreadyExistsError } from '../../User/domain/UserAlreadyExistsError';
import { UserNotFoundError } from '../../User/domain/UserNotFoundError';
import { UserMapper } from '../../User/infrastructure/dtos/user.mapper';

export class ExpressAuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Los datos ya están validados por el middleware de Zod
      const { name, email, password } = req.body;

      const newUser = await ServiceContainer.auth.register.run(
        name,
        email,
        password,
      );

      // TODO: generar el token
      return res.status(201).json({
        message: 'User registered successfully',
        user: UserMapper.toResponseDto(newUser),
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

      // TODO: generar el token
      // En un sistema real, aquí generarías un token JWT
      // Por ahora, simplemente devolvemos un mensaje de éxito
      return res.status(200).json({
        message: 'Login successful',
        user: UserMapper.toResponseDto(loggedInUser),
        // token: generatedToken
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
}
