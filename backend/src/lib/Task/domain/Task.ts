import { Priority } from './Priority.enum';
import type { TaskCategoryId } from './TaskCategoryId';
import { TaskCompleted } from './TaskCompleted';
import { TaskCompletedAt } from './TaskCompletedAt';
import type { TaskCreatedAt } from './TaskCreatedAt';
import type { TaskDescription } from './TaskDescription';
import type { TaskDueDate } from './TaskDueDate';
import type { TaskId } from './TaskId';
import { TaskPriority } from './TaskPriority';
import type { TaskTagIds } from './TaskTagIds';
import type { TaskTitle } from './TaskTitle';
import type { TaskUpdatedAt } from './TaskUpdatedAt';
import type { TaskUserId } from './TaskUserId';

export class Task {
  id?: TaskId;
  title: TaskTitle;
  description?: TaskDescription;
  completed: TaskCompleted;
  priority: TaskPriority;
  dueDate?: TaskDueDate;
  completedAt?: TaskCompletedAt;
  userId: TaskUserId;
  categoryId?: TaskCategoryId;
  tagIds?: TaskTagIds;
  createdAt?: TaskCreatedAt;
  updatedAt?: TaskUpdatedAt;

  private constructor(
    title: TaskTitle,
    userId: TaskUserId,
    completed: TaskCompleted,
    priority?: TaskPriority,
    description?: TaskDescription,
    dueDate?: TaskDueDate,
    completedAt?: TaskCompletedAt,
    categoryId?: TaskCategoryId,
    tagIds?: TaskTagIds,
    id?: TaskId,
    createdAt?: TaskCreatedAt,
    updatedAt?: TaskUpdatedAt,
  ) {
    this.title = title;
    this.userId = userId;
    this.completed = completed;
    this.priority = priority || new TaskPriority(Priority.MEDIUM);
    if (description) this.description = description;
    if (dueDate) this.dueDate = dueDate;
    if (completedAt) this.completedAt = completedAt;
    if (categoryId) this.categoryId = categoryId;
    if (tagIds) this.tagIds = tagIds;
    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  /**
   * Factory for creating a new task.
   * Used in the context of Task creation.
   */
  public static create(
    title: TaskTitle,
    userId: TaskUserId,
    description?: TaskDescription,
    priority?: TaskPriority,
    dueDate?: TaskDueDate,
    categoryId?: TaskCategoryId,
    tagIds?: TaskTagIds,
  ): Task {
    return new Task(
      title,
      userId,
      new TaskCompleted(false),
      priority,
      description,
      dueDate,
      undefined,
      categoryId,
      tagIds,
    );
  }

  /**
   * Factory for reconstructing a task from persistence.
   * Used by repositories when hydrating domain objects.
   */
  public static fromPrimitives(
    title: TaskTitle,
    userId: TaskUserId,
    completed: TaskCompleted,
    priority: TaskPriority,
    id?: TaskId,
    description?: TaskDescription,
    dueDate?: TaskDueDate,
    completedAt?: TaskCompletedAt,
    categoryId?: TaskCategoryId,
    tagIds?: TaskTagIds,
    createdAt?: TaskCreatedAt,
    updatedAt?: TaskUpdatedAt,
  ): Task {
    return new Task(
      title,
      userId,
      completed,
      priority,
      description,
      dueDate,
      completedAt,
      categoryId,
      tagIds,
      id,
      createdAt,
      updatedAt,
    );
  }

  public markAsCompleted(): void {
    this.completed = new TaskCompleted(true);
    this.completedAt = new TaskCompletedAt(new Date());
  }

  public markAsIncomplete(): void {
    this.completed = new TaskCompleted(false);
    this.completedAt = new TaskCompletedAt(null);
  }

  public isOverdue(): boolean {
    if (!this.dueDate?.value || this.completed.value) {
      return false;
    }
    return new Date() > this.dueDate.value;
  }

  public getDaysUntilDue(): number | null {
    if (!this.dueDate?.value) {
      return null;
    }
    const today = new Date();
    const diffTime = this.dueDate.value.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
