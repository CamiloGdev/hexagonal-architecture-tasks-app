import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { TagNotFoundError } from '../domain/TagNotFoundError';
import { TagMapper } from './dtos/tag.mapper';

export class ExpressTagController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // El middleware authMiddleware ya garantiza que req.user existe
      const userId = req.user?.id as string;

      const tags = await ServiceContainer.tag.getAll.run(userId);

      return res.status(200).json(TagMapper.toResponseDtoList(tags));
    } catch (error) {
      next(error);
    }
  }

  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const tag = await ServiceContainer.tag.getOneById.run(
        req.params.id as string,
        userId,
      );

      return res.status(200).json(TagMapper.toResponseDto(tag));
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { name, color } = req.body;

      const createdTag = await ServiceContainer.tag.create.run(
        name,
        userId,
        color,
      );

      return res.status(201).json(TagMapper.toResponseDto(createdTag));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { name, color } = req.body;
      const tagId = req.params.id;

      await ServiceContainer.tag.update.run(
        tagId as string,
        userId,
        name,
        color,
      );

      // Get updated tag to return
      const updatedTag = await ServiceContainer.tag.getOneById.run(
        tagId as string,
        userId,
      );

      return res.status(200).json(TagMapper.toResponseDto(updatedTag));
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      await ServiceContainer.tag.delete.run(req.params.id as string, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async getByTaskId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const taskId = req.params.taskId as string;

      const tags = await ServiceContainer.tag.getByTaskId.run(taskId, userId);

      return res.status(200).json(TagMapper.toResponseDtoList(tags));
    } catch (error) {
      next(error);
    }
  }

  async assignToTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const tagId = req.params.id as string;
      const taskId = req.params.taskId as string;

      await ServiceContainer.tag.assignToTask.run(tagId, taskId, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  async unassignFromTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const tagId = req.params.id as string;
      const taskId = req.params.taskId as string;

      await ServiceContainer.tag.unassignFromTask.run(tagId, taskId, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}
