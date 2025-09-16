import { PrismaClient } from '@prisma/client';
import { Category } from '../domain/Category';
import { CategoryColor } from '../domain/CategoryColor';
import { CategoryCreatedAt } from '../domain/CategoryCreatedAt';
import { CategoryId } from '../domain/CategoryId';
import { CategoryName } from '../domain/CategoryName';
import { CategoryNotFoundError } from '../domain/CategoryNotFoundError';
import type { CategoryRepository } from '../domain/CategoryRepository';
import { CategoryUpdatedAt } from '../domain/CategoryUpdatedAt';
import { CategoryUserId } from '../domain/CategoryUserId';

type PrismaCategory = {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

export class PrismaCategoryRepository implements CategoryRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(category: Category): Promise<Category> {
    const createdCategory = await this.prisma.category.create({
      data: {
        name: category.name.value,
        color: category.color?.value || null,
        user_id: category.userId.value,
      },
    });

    return this.mapToDomain(createdCategory);
  }

  async getAll(userId: CategoryUserId): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        user_id: userId.value,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return categories.map((category) => this.mapToDomain(category));
  }

  async getOneById(
    id: CategoryId,
    userId: CategoryUserId,
  ): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: id.value,
        user_id: userId.value,
      },
    });

    if (!category) {
      return null;
    }

    return this.mapToDomain(category);
  }

  async update(category: Category): Promise<Category> {
    if (!category.id) {
      throw new CategoryNotFoundError();
    }

    try {
      const updatedCategory = await this.prisma.category.update({
        where: {
          id: category.id.value,
        },
        data: {
          name: category.name.value,
          color: category.color?.value || null,
        },
      });

      return this.mapToDomain(updatedCategory);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new CategoryNotFoundError();
      }
      throw error;
    }
  }

  async delete(id: CategoryId, userId: CategoryUserId): Promise<void> {
    try {
      await this.prisma.category.delete({
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
        throw new CategoryNotFoundError();
      }
      throw error;
    }
  }

  async hasTasks(id: CategoryId, userId: CategoryUserId): Promise<boolean> {
    const taskCount = await this.prisma.task.count({
      where: {
        category_id: id.value,
        user_id: userId.value,
      },
    });

    return taskCount > 0;
  }

  private mapToDomain(category: PrismaCategory): Category {
    return Category.fromPrimitives(
      new CategoryName(category.name),
      new CategoryUserId(category.user_id),
      new CategoryId(category.id),
      category.color ? new CategoryColor(category.color) : undefined,
      new CategoryCreatedAt(category.created_at),
      new CategoryUpdatedAt(category.updated_at),
    );
  }

  // Method to close the Prisma connection when necessary
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
