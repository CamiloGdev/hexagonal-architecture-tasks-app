import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { TaskNotFoundError } from '../domain/TaskNotFoundError';
import { TaskMapper } from './dtos/task.mapper';

export class ExpressTaskController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // El middleware authMiddleware ya garantiza que req.user existe
      const userId = req.user?.id as string;

      // La validación y transformación ya la hizo el middleware validate
      // req.query ya tiene los tipos correctos
      const filters = req.query;

      const tasks = await ServiceContainer.task.getAll.execute({
        userId,
        filters,
      });

      return res.status(200).json(TaskMapper.toResponseDtoList(tasks));
    } catch (error) {
      next(error);
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const task = await ServiceContainer.task.getOneById.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(200).json(TaskMapper.toResponseDto(task));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { title, description, priority, dueDate, categoryId, tagIds } =
        req.body;

      const createdTask = await ServiceContainer.task.create.execute({
        title,
        userId,
        description,
        priority,
        dueDate,
        categoryId,
        tagIds,
      });

      return res.status(201).json(TaskMapper.toResponseDto(createdTask));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const {
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      } = req.body;
      const taskId = req.params.id;

      const updatedTask = await ServiceContainer.task.update.execute({
        id: taskId as string,
        userId,
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      });

      return res.status(200).json(TaskMapper.toResponseDto(updatedTask));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      await ServiceContainer.task.delete.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async toggleComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { completed } = req.body;
      const taskId = req.params.id;

      const updatedTask = await ServiceContainer.task.toggleComplete.execute({
        id: taskId as string,
        userId,
        completed,
      });

      return res.status(200).json(TaskMapper.toResponseDto(updatedTask));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}
