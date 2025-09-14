import { TaskId } from '../../domain/TaskId';
import { TaskNotFoundError } from '../../domain/TaskNotFoundError';
import type { TaskRepository, TaskWithTags } from '../../domain/TaskRepository';
import { TaskUserId } from '../../domain/TaskUserId';

export interface TaskGetOneByIdRequest {
  id: string;
  userId: string;
}

export class TaskGetOneById {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskGetOneByIdRequest): Promise<TaskWithTags> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    const task = await this.taskRepository.getOneById(taskId, userId);

    if (!task) {
      throw new TaskNotFoundError();
    }

    return task;
  }
}
