import {
  type Prisma,
  PrismaClient,
  type Priority as PrismaPriority,
} from '@prisma/client'; // renombra al importar
import type { Priority } from '../domain/Priority.enum'; // el enum de tu dominio
import { Task } from '../domain/Task';
import { TaskCategoryId } from '../domain/TaskCategoryId';
import { TaskCompleted } from '../domain/TaskCompleted';
import { TaskCompletedAt } from '../domain/TaskCompletedAt';
import { TaskCreatedAt } from '../domain/TaskCreatedAt';
import { TaskDescription } from '../domain/TaskDescription';
import { TaskDueDate } from '../domain/TaskDueDate';
import { TaskId } from '../domain/TaskId';
import { TaskNotFoundError } from '../domain/TaskNotFoundError';
import { TaskPriority } from '../domain/TaskPriority';
import type {
  TagInfo,
  TaskFilters,
  TaskRepository,
  TaskWithTags,
} from '../domain/TaskRepository';
import { TaskTagIds } from '../domain/TaskTagIds';
import { TaskTitle } from '../domain/TaskTitle';
import { TaskUpdatedAt } from '../domain/TaskUpdatedAt';
import { TaskUserId } from '../domain/TaskUserId';

type PrismaTask = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: PrismaPriority;
  due_date: Date | null;
  completed_at: Date | null;
  user_id: string;
  category_id: string;
  created_at: Date;
  updated_at: Date;
  taskTags?: {
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }[];
};

export class PrismaTaskRepository implements TaskRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(taskData: Task): Promise<TaskWithTags> {
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create the task
      const createdTask = await prisma.task.create({
        data: {
          title: taskData.title.value,
          description: taskData.description?.value || null,
          completed: taskData.completed.value,
          priority: taskData.priority.value,
          due_date: taskData.dueDate?.value || null,
          completed_at: taskData.completedAt?.value || null,
          user_id: taskData.userId.value,
          category_id: taskData.categoryId.value,
        },
      });

      // Create tag associations if tags are provided
      if (taskData.tagIds && !taskData.tagIds.isEmpty()) {
        await prisma.taskTag.createMany({
          data: taskData.tagIds.value.map((tagId) => ({
            task_id: createdTask.id,
            tag_id: tagId,
          })),
        });
      }

      // Fetch the complete task with tags
      return await prisma.task.findUnique({
        where: { id: createdTask.id },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    if (!result) {
      throw new Error('Failed to create task');
    }

    return this.mapToTaskWithTags(result);
  }

  async getAll(
    userId: TaskUserId,
    filters?: TaskFilters,
  ): Promise<TaskWithTags[]> {
    const where: Prisma.TaskWhereInput = {
      // Error 1 (warning)
      user_id: userId.value,
    };

    // Apply filters
    if (filters?.completed !== undefined) {
      where.completed = filters.completed;
    }

    if (filters?.categoryId) {
      where.category_id = filters.categoryId;
    }

    if (filters?.priority) {
      where.priority = filters.priority as PrismaPriority;
    }

    if (filters?.dueDateFrom || filters?.dueDateTo) {
      where.due_date = {};
      if (filters.dueDateFrom) {
        where.due_date.gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        where.due_date.lte = filters.dueDateTo;
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Optimize tag filtering by moving it to the database level
    if (filters?.tags && filters.tags.length > 0) {
      where.taskTags = {
        some: {
          tag: {
            name: {
              in: filters.tags,
            },
          },
        },
      };
    }

    // Handle sorting
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (filters?.sortBy) {
      const sortField =
        filters.sortBy === 'created_at'
          ? 'created_at'
          : filters.sortBy === 'due_date'
            ? 'due_date'
            : filters.sortBy === 'priority'
              ? 'priority'
              : filters.sortBy === 'title'
                ? 'title'
                : 'created_at';

      orderBy[sortField] = filters.sortDirection || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy,
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return tasks.map((task) => this.mapToTaskWithTags(task));
  }

  async getOneById(
    id: TaskId,
    userId: TaskUserId,
  ): Promise<TaskWithTags | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: id.value,
        user_id: userId.value,
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return this.mapToTaskWithTags(task);
  }

  async update(taskData: Task): Promise<TaskWithTags> {
    if (!taskData.id) {
      throw new TaskNotFoundError();
    }

    const taskId = taskData.id;

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // Update the task
        const updatedTask = await prisma.task.update({
          where: {
            id: taskId.value,
          },
          data: {
            title: taskData.title.value,
            description: taskData.description?.value || null,
            completed: taskData.completed.value,
            priority: taskData.priority.value,
            due_date: taskData.dueDate?.value || null,
            completed_at: taskData.completedAt?.value || null,
            category_id: taskData.categoryId.value,
          },
        });

        // Handle tag associations if tagIds is provided
        if (taskData.tagIds !== undefined) {
          // Delete existing tag associations
          await prisma.taskTag.deleteMany({
            where: {
              task_id: taskId.value, // Error 4 (warning)
            },
          });

          // Create new tag associations if tags are provided
          if (!taskData.tagIds.isEmpty()) {
            await prisma.taskTag.createMany({
              data: taskData.tagIds.value.map((tagId) => ({
                task_id: taskId.value, // Error 5 (warning)
                tag_id: tagId,
              })),
            });
          }
        }

        // Fetch the complete task with tags
        return await prisma.task.findUnique({
          where: { id: updatedTask.id },
          include: {
            taskTags: {
              include: {
                tag: true,
              },
            },
          },
        });
      });

      if (!result) {
        throw new TaskNotFoundError();
      }

      return this.mapToTaskWithTags(result);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new TaskNotFoundError();
      }
      throw error;
    }
  }

  async delete(id: TaskId, userId: TaskUserId): Promise<void> {
    try {
      await this.prisma.task.delete({
        where: {
          id: id.value,
          user_id: userId.value,
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new TaskNotFoundError();
      }
      throw error;
    }
  }

  async markAsCompleted(id: TaskId, userId: TaskUserId): Promise<TaskWithTags> {
    try {
      const updatedTask = await this.prisma.task.update({
        where: {
          id: id.value,
          user_id: userId.value,
        },
        data: {
          completed: true,
          completed_at: new Date(),
        },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return this.mapToTaskWithTags(updatedTask);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new TaskNotFoundError();
      }
      throw error;
    }
  }

  async markAsIncomplete(
    id: TaskId,
    userId: TaskUserId,
  ): Promise<TaskWithTags> {
    try {
      const updatedTask = await this.prisma.task.update({
        where: {
          id: id.value,
          user_id: userId.value,
        },
        data: {
          completed: false,
          completed_at: null,
        },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return this.mapToTaskWithTags(updatedTask);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new TaskNotFoundError();
      }
      throw error;
    }
  }

  private extractTagsFromTask(task: PrismaTask): {
    tagIds: string[];
    tagInfo: TagInfo[];
  } {
    if (!task.taskTags || task.taskTags.length === 0) {
      return { tagIds: [], tagInfo: [] };
    }

    const tagInfo: TagInfo[] = task.taskTags.map((taskTag) => {
      const tag: TagInfo = {
        id: taskTag.tag.id,
        name: taskTag.tag.name,
      };

      if (taskTag.tag.color) {
        tag.color = taskTag.tag.color;
      }

      return tag;
    });

    const tagIds = tagInfo.map((tag) => tag.id);

    return { tagIds, tagInfo };
  }

  private mapToDomain(task: PrismaTask): Task {
    // Extract tag IDs from the taskTags relation
    const { tagIds } = this.extractTagsFromTask(task);

    return Task.fromPrimitives(
      new TaskTitle(task.title),
      new TaskUserId(task.user_id),
      new TaskCategoryId(task.category_id),
      new TaskCompleted(task.completed),
      new TaskPriority(task.priority as Priority),
      new TaskId(task.id),
      task.description ? new TaskDescription(task.description) : undefined,
      task.due_date ? new TaskDueDate(task.due_date) : undefined,
      task.completed_at ? new TaskCompletedAt(task.completed_at) : undefined,
      tagIds.length > 0 ? new TaskTagIds(tagIds) : undefined,
      new TaskCreatedAt(task.created_at),
      new TaskUpdatedAt(task.updated_at),
    );
  }

  private mapToTaskWithTags(task: PrismaTask): TaskWithTags {
    const domainTask = this.mapToDomain(task);
    const { tagInfo } = this.extractTagsFromTask(task);

    return {
      task: domainTask,
      tags: tagInfo,
    };
  }

  // Method to close the Prisma connection when necessary
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
