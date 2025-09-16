import type { Priority } from '../../domain/Priority.enum';
import { Task } from '../../domain/Task';
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

export interface TaskReplaceRequest {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: Priority;
  categoryId: string;
  description: string | null;
  dueDate: Date | null;
  tagIds: string[];
}

export class TaskReplace {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: TaskReplaceRequest): Promise<TaskWithTags> {
    const taskId = new TaskId(request.id);
    const userId = new TaskUserId(request.userId);

    // 1. Verify that the original task exists and belongs to the user
    const originalTask = await this.taskRepository.getOneById(taskId, userId);
    if (!originalTask) {
      throw new TaskNotFoundError();
    }

    // 2. Create a new instance of domain `Task` with the request data
    // Using `fromPrimitives` because we are reconstructing a complete object.
    const taskToSave = Task.fromPrimitives(
      new TaskTitle(request.title),
      new TaskUserId(request.userId),
      new TaskCategoryId(request.categoryId),
      new TaskCompleted(request.completed),
      new TaskPriority(request.priority),
      new TaskId(request.id), // Keep the original ID
      new TaskDescription(request.description),
      new TaskDueDate(request.dueDate),
      originalTask.task.completedAt, // Preserve completedAt if already completed
      new TaskTagIds(request.tagIds),
      originalTask.task.createdAt, // Preserve original creation date
    );

    // 3. Handle completion status changes
    if (request.completed && !originalTask.task.completed.value) {
      taskToSave.markAsCompleted();
    } else if (!request.completed) {
      taskToSave.markAsIncomplete();
    }

    // 4. Persist the replaced task
    return await this.taskRepository.update(taskToSave);
  }
}
