import { PrismaClient } from '@prisma/client';
import { Tag } from '../domain/Tag';
import { TagColor } from '../domain/TagColor';
import { TagCreatedAt } from '../domain/TagCreatedAt';
import { TagId } from '../domain/TagId';
import { TagName } from '../domain/TagName';
import { TagNotFoundError } from '../domain/TagNotFoundError';
import type { TagRepository } from '../domain/TagRepository';
import { TagUpdatedAt } from '../domain/TagUpdatedAt';
import { TagUserId } from '../domain/TagUserId';

type PrismaTag = {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

export class PrismaTagRepository implements TagRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(tag: Tag): Promise<Tag> {
    const createdTag = await this.prisma.tag.create({
      data: {
        name: tag.name.value,
        color: tag.color?.value || null,
        user_id: tag.userId.value,
      },
    });

    return this.mapToDomain(createdTag);
  }

  async getAll(userId: TagUserId): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        user_id: userId.value,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return tags.map((tag) => this.mapToDomain(tag));
  }

  async getOneById(id: TagId, userId: TagUserId): Promise<Tag | null> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        id: id.value,
        user_id: userId.value,
      },
    });

    if (!tag) {
      return null;
    }

    return this.mapToDomain(tag);
  }

  async update(tag: Tag): Promise<Tag> {
    if (!tag.id) {
      throw new TagNotFoundError();
    }

    try {
      const updatedTag = await this.prisma.tag.update({
        where: {
          id: tag.id.value,
        },
        data: {
          name: tag.name.value,
          color: tag.color?.value || null,
        },
      });

      return this.mapToDomain(updatedTag);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new TagNotFoundError();
      }
      throw error;
    }
  }

  async delete(id: TagId, userId: TagUserId): Promise<void> {
    try {
      await this.prisma.tag.delete({
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
        throw new TagNotFoundError();
      }
      throw error;
    }
  }

  async getTagsByTaskId(taskId: string, userId: TagUserId): Promise<Tag[]> {
    const taskTags = await this.prisma.taskTag.findMany({
      where: {
        task_id: taskId,
        tag: {
          user_id: userId.value,
        },
      },
      include: {
        tag: true,
      },
    });

    return taskTags.map((taskTag) => this.mapToDomain(taskTag.tag));
  }

  async assignTagToTask(
    tagId: TagId,
    taskId: string,
    userId: TagUserId,
  ): Promise<void> {
    // First verify the task belongs to the user
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: userId.value,
      },
    });

    if (!task) {
      throw new Error('Task not found or does not belong to user');
    }

    // Check if the assignment already exists
    const existingAssignment = await this.prisma.taskTag.findUnique({
      where: {
        task_id_tag_id: {
          task_id: taskId,
          tag_id: tagId.value,
        },
      },
    });

    if (existingAssignment) {
      return; // Already assigned, no need to create duplicate
    }

    await this.prisma.taskTag.create({
      data: {
        task_id: taskId,
        tag_id: tagId.value,
      },
    });
  }

  async unassignTagFromTask(
    tagId: TagId,
    taskId: string,
    userId: TagUserId,
  ): Promise<void> {
    // First verify the task belongs to the user
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: userId.value,
      },
    });

    if (!task) {
      throw new Error('Task not found or does not belong to user');
    }

    try {
      await this.prisma.taskTag.delete({
        where: {
          task_id_tag_id: {
            task_id: taskId,
            tag_id: tagId.value,
          },
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        // Assignment doesn't exist, which is fine
        return;
      }
      throw error;
    }
  }

  private mapToDomain(tag: PrismaTag): Tag {
    return Tag.fromPrimitives(
      new TagName(tag.name),
      new TagUserId(tag.user_id),
      new TagId(tag.id),
      tag.color ? new TagColor(tag.color) : undefined,
      new TagCreatedAt(tag.created_at),
      new TagUpdatedAt(tag.updated_at),
    );
  }

  // Method to close the Prisma connection when necessary
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
