import type { Task } from './Task';
import type { TaskId } from './TaskId';
import type { TaskUserId } from './TaskUserId';

export interface TaskFilters {
  completed?: boolean | undefined;
  categoryId?: string | undefined;
  priority?: string | undefined;
  dueDateFrom?: Date | undefined;
  dueDateTo?: Date | undefined;
  search?: string | undefined;
  tags?: string[] | undefined;
  sortBy?: 'created_at' | 'due_date' | 'priority' | 'title' | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
}

export interface TaskRepository {
  create(task: Task): Promise<Task>;
  getAll(userId: TaskUserId, filters?: TaskFilters): Promise<Task[]>;
  getOneById(id: TaskId, userId: TaskUserId): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  delete(id: TaskId, userId: TaskUserId): Promise<void>;
  markAsCompleted(id: TaskId, userId: TaskUserId): Promise<Task>;
  markAsIncomplete(id: TaskId, userId: TaskUserId): Promise<Task>;
}
