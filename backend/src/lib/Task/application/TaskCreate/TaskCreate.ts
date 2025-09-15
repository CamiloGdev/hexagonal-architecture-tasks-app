import type { Priority } from '../../domain/Priority.enum';
import { Task } from '../../domain/Task';
import { TaskCategoryId } from '../../domain/TaskCategoryId';
import { TaskDescription } from '../../domain/TaskDescription';
import { TaskDueDate } from '../../domain/TaskDueDate';
import { TaskPriority } from '../../domain/TaskPriority';
import type { TaskRepository, TaskWithTags } from '../../domain/TaskRepository';
import { TaskTagIds } from '../../domain/TaskTagIds';
import { TaskTitle } from '../../domain/TaskTitle';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskCreateRequest {
  title: string;
  userId: string;
  categoryId: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tagIds?: string[];
}

export class TaskCreate {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskCreateRequest): Promise<TaskWithTags> {
    const task = Task.create(
      new TaskTitle(request.title),
      new TaskUserId(request.userId),
      new TaskCategoryId(request.categoryId),
      request.description
        ? new TaskDescription(request.description)
        : undefined,
      request.priority ? new TaskPriority(request.priority) : undefined,
      request.dueDate ? new TaskDueDate(request.dueDate) : undefined,
      request.tagIds ? new TaskTagIds(request.tagIds) : undefined,
    );

    return await this.taskRepository.create(task);
  }
}
