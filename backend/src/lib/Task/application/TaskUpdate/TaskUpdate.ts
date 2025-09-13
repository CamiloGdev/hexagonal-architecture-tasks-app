import type { Task } from '../../domain/Task';
import { TaskCategoryId } from '../../domain/TaskCategoryId';
import { TaskCompleted } from '../../domain/TaskCompleted';
import { TaskDescription } from '../../domain/TaskDescription';
import { TaskDueDate } from '../../domain/TaskDueDate';
import { TaskId } from '../../domain/TaskId';
import { TaskNotFoundError } from '../../domain/TaskNotFoundError';
import { type Priority, TaskPriority } from '../../domain/TaskPriority';
import type { TaskRepository } from '../../domain/TaskRepository';
import { TaskTitle } from '../../domain/TaskTitle';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskUpdateRequest {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  categoryId?: string;
  completed?: boolean;
}

export class TaskUpdate {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskUpdateRequest): Promise<Task> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    const existingTask = await this.taskRepository.getOneById(taskId, userId);

    if (!existingTask) {
      throw new TaskNotFoundError();
    }

    // Update only provided fields
    if (request.title !== undefined) {
      existingTask.title = new TaskTitle(request.title);
    }

    if (request.description !== undefined) {
      existingTask.description = new TaskDescription(request.description);
    }

    if (request.priority !== undefined) {
      existingTask.priority = new TaskPriority(request.priority);
    }

    if (request.dueDate !== undefined) {
      existingTask.dueDate = new TaskDueDate(request.dueDate);
    }

    if (request.categoryId !== undefined) {
      existingTask.categoryId = new TaskCategoryId(request.categoryId);
    }

    if (request.completed !== undefined) {
      existingTask.completed = new TaskCompleted(request.completed);
      if (request.completed) {
        existingTask.markAsCompleted();
      } else {
        existingTask.markAsIncomplete();
      }
    }

    return await this.taskRepository.update(existingTask);
  }
}
