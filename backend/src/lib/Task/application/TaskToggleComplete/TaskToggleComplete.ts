import type { Task } from '../../domain/Task';
import { TaskId } from '../../domain/TaskId';
import { TaskNotFoundError } from '../../domain/TaskNotFoundError';
import type { TaskRepository } from '../../domain/TaskRepository';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskToggleCompleteRequest {
  id: string;
  userId: string;
  completed: boolean;
}

export class TaskToggleComplete {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskToggleCompleteRequest): Promise<Task> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    // Verify task exists and belongs to user
    const existingTask = await this.taskRepository.getOneById(taskId, userId);

    if (!existingTask) {
      throw new TaskNotFoundError();
    }

    if (request.completed) {
      return await this.taskRepository.markAsCompleted(taskId, userId);
    } else {
      return await this.taskRepository.markAsIncomplete(taskId, userId);
    }
  }
}
