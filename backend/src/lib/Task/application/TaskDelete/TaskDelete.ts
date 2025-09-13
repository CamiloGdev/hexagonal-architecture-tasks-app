import { TaskId } from '../../domain/TaskId';
import { TaskNotFoundError } from '../../domain/TaskNotFoundError';
import type { TaskRepository } from '../../domain/TaskRepository';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskDeleteRequest {
  id: string;
  userId: string;
}

export class TaskDelete {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskDeleteRequest): Promise<void> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    // Verify task exists and belongs to user
    const existingTask = await this.taskRepository.getOneById(taskId, userId);

    if (!existingTask) {
      throw new TaskNotFoundError();
    }

    await this.taskRepository.delete(taskId, userId);
  }
}
