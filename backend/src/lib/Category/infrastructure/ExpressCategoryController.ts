import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { CategoryHasTasksError } from '../domain/CategoryHasTasksError';
import { CategoryNotFoundError } from '../domain/CategoryNotFoundError';
import { CategoryMapper } from './dtos/category.mapper';

export class ExpressCategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // El middleware authMiddleware ya garantiza que req.user existe
      const userId = req.user?.id as string;

      const categories = await ServiceContainer.category.getAll.execute({
        userId,
      });

      return res.status(200).json(CategoryMapper.toResponseDtoList(categories));
    } catch (error) {
      next(error);
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const category = await ServiceContainer.category.getOneById.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(200).json(CategoryMapper.toResponseDto(category));
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { name, color } = req.body;

      const createdCategory = await ServiceContainer.category.create.execute({
        name,
        userId,
        color,
      });

      return res
        .status(201)
        .json(CategoryMapper.toResponseDto(createdCategory));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { name, color } = req.body;
      const categoryId = req.params.id;

      const updatedCategory = await ServiceContainer.category.update.execute({
        id: categoryId as string,
        userId,
        name,
        color,
      });

      return res
        .status(200)
        .json(CategoryMapper.toResponseDto(updatedCategory));
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      await ServiceContainer.category.delete.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof CategoryHasTasksError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
