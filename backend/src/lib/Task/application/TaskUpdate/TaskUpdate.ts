import type { Priority } from '../../domain/Priority.enum';
import { TaskCategoryId } from '../../domain/TaskCategoryId';
import { TaskCompleted } from '../../domain/TaskCompleted';
import { TaskDescription } from '../../domain/TaskDescription';
import { TaskDueDate } from '../../domain/TaskDueDate';
import { TaskId } from '../../domain/TaskId';
import { TaskNotFoundError } from '../../domain/TaskNotFoundError';
import { TaskPriority } from '../../domain/TaskPriority';
import type { TaskRepository, TaskWithTags } from '../../domain/TaskRepository';
import { TaskTagIds } from '../../domain/TaskTagIds';
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
  tagIds?: string[];
}

export class TaskUpdate {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskUpdateRequest): Promise<TaskWithTags> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    const taskWithTags = await this.taskRepository.getOneById(taskId, userId);

    if (!taskWithTags) {
      throw new TaskNotFoundError();
    }

    const existingTask = taskWithTags.task;

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

    if (request.tagIds !== undefined) {
      existingTask.tagIds = new TaskTagIds(request.tagIds);
    }

    return await this.taskRepository.update(existingTask);
  }
}
