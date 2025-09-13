import type { Task } from '../../domain/Task';
import type { TaskFilters, TaskRepository } from '../../domain/TaskRepository';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskGetAllRequest {
  userId: string;
  filters?: TaskFilters;
}

export class TaskGetAll {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskGetAllRequest): Promise<Task[]> {
    const userId = new TaskUserId(request.userId);
    return await this.taskRepository.getAll(userId, request.filters);
  }
}
