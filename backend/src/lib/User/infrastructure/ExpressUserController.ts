import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { UserAlreadyExistsError } from '../domain/UserAlreadyExistsError';
import { UserNotFoundError } from '../domain/UserNotFoundError';
import { UserMapper } from './dtos/user.mapper';

export class ExpressUserController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await ServiceContainer.user.getAll.run();

      return res.status(200).json(UserMapper.toResponseDtoList(users));
    } catch (error) {
      next(error);
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      // El ID ya está validado por el middleware de Zod
      const user = await ServiceContainer.user.getOneById.run(
        req.params.id as string,
      );

      return res.status(200).json(UserMapper.toResponseDto(user));
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body as {
        name: string;
        email: string;
      };
      const createdUser = await ServiceContainer.user.create.run(name, email);

      return res.status(201).json(UserMapper.toResponseDto(createdUser));
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return res.status(409).json({ message: error.message });
      }

      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      // Los datos ya están validados por el middleware de Zod
      // PUT requiere todos los campos, PATCH permite campos opcionales
      const { email, name } = req.body;
      const userId = req.params.id as string;

      const updatedUser = await ServiceContainer.user.edit.run(
        userId,
        name,
        email,
      );

      return res.status(200).json(UserMapper.toResponseDto(updatedUser));
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ServiceContainer.user.delete.run(req.params.id as string);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      next(error);
    }
  }
}
