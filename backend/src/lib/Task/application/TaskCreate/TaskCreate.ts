import type { Priority } from '../../domain/Priority.enum';
import { Task } from '../../domain/Task';
import { TaskCategoryId } from '../../domain/TaskCategoryId';
import { TaskDescription } from '../../domain/TaskDescription';
import { TaskDueDate } from '../../domain/TaskDueDate';
import { TaskPriority } from '../../domain/TaskPriority';
import type { TaskRepository } from '../../domain/TaskRepository';
import { TaskTitle } from '../../domain/TaskTitle';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskCreateRequest {
  title: string;
  userId: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  categoryId?: string;
}

export class TaskCreate {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskCreateRequest): Promise<Task> {
    const task = Task.create(
      new TaskTitle(request.title),
      new TaskUserId(request.userId),
      request.description
        ? new TaskDescription(request.description)
        : undefined,
      request.priority ? new TaskPriority(request.priority) : undefined,
      request.dueDate ? new TaskDueDate(request.dueDate) : undefined,
      request.categoryId ? new TaskCategoryId(request.categoryId) : undefined,
    );

    return await this.taskRepository.create(task);
  }
}
