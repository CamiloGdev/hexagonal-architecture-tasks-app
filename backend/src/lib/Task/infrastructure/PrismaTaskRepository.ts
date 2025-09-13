import { PrismaClient } from '../../../generated/prisma';
import { Task } from '../domain/Task';
import { TaskCategoryId } from '../domain/TaskCategoryId';
import { TaskCompleted } from '../domain/TaskCompleted';
import { TaskCompletedAt } from '../domain/TaskCompletedAt';
import { TaskCreatedAt } from '../domain/TaskCreatedAt';
import { TaskDescription } from '../domain/TaskDescription';
import { TaskDueDate } from '../domain/TaskDueDate';
import { TaskId } from '../domain/TaskId';
import { TaskNotFoundError } from '../domain/TaskNotFoundError';
import { type Priority, TaskPriority } from '../domain/TaskPriority';
import type { TaskFilters, TaskRepository } from '../domain/TaskRepository';
import { TaskTitle } from '../domain/TaskTitle';
import { TaskUpdatedAt } from '../domain/TaskUpdatedAt';
import { TaskUserId } from '../domain/TaskUserId';

type PrismaTask = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: Date | null;
  completed_at: Date | null;
  user_id: string;
  category_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export class PrismaTaskRepository implements TaskRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(task: Task): Promise<Task> {
    const createdTask = await this.prisma.task.create({
      data: {
        title: task.title.value,
        description: task.description?.value || null,
        completed: task.completed.value,
        priority: task.priority.value,
        due_date: task.dueDate?.value || null,
        completed_at: task.completedAt?.value || null,
        user_id: task.userId.value,
        category_id: task.categoryId?.value || null,
      },
    });

    return this.mapToDomain(createdTask);
  }

  async getAll(userId: TaskUserId, filters?: TaskFilters): Promise<Task[]> {
    const where: any = {
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
      where.priority = filters.priority;
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
    const orderBy: any = {};
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

    return tasks.map((task: any) => this.mapToDomain(task));
  }

  async getOneById(id: TaskId, userId: TaskUserId): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: id.value,
        user_id: userId.value,
      },
    });

    if (!task) {
      return null;
    }

    return this.mapToDomain(task);
  }

  async update(task: Task): Promise<Task> {
    if (!task.id) {
      throw new TaskNotFoundError();
    }

    try {
      const updatedTask = await this.prisma.task.update({
        where: {
          id: task.id.value,
        },
        data: {
          title: task.title.value,
          description: task.description?.value || null,
          completed: task.completed.value,
          priority: task.priority.value,
          due_date: task.dueDate?.value || null,
          completed_at: task.completedAt?.value || null,
          category_id: task.categoryId?.value || null,
        },
      });

      return this.mapToDomain(updatedTask);
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

  async markAsCompleted(id: TaskId, userId: TaskUserId): Promise<Task> {
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
      });

      return this.mapToDomain(updatedTask);
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

  async markAsIncomplete(id: TaskId, userId: TaskUserId): Promise<Task> {
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
      });

      return this.mapToDomain(updatedTask);
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

  private mapToDomain(task: PrismaTask): Task {
    return Task.fromPrimitives(
      new TaskTitle(task.title),
      new TaskUserId(task.user_id),
      new TaskCompleted(task.completed),
      new TaskPriority(task.priority),
      new TaskId(task.id),
      task.description ? new TaskDescription(task.description) : undefined,
      task.due_date ? new TaskDueDate(task.due_date) : undefined,
      task.completed_at ? new TaskCompletedAt(task.completed_at) : undefined,
      task.category_id ? new TaskCategoryId(task.category_id) : undefined,
      new TaskCreatedAt(task.created_at),
      new TaskUpdatedAt(task.updated_at),
    );
  }

  // Method to close the Prisma connection when necessary
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
