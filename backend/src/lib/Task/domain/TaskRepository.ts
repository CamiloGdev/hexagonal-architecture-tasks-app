import type { Task } from './Task';
import type { TaskId } from './TaskId';
import type { TaskUserId } from './TaskUserId';

// Tipo para representar la información de un tag en las respuestas
export interface TagInfo {
  id: string;
  name: string;
  color?: string;
}

// Tipo para representar una tarea con sus tags asociados
export interface TaskWithTags {
  task: Task;
  tags: TagInfo[];
}

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
  create(task: Task): Promise<TaskWithTags>;
  getAll(userId: TaskUserId, filters?: TaskFilters): Promise<TaskWithTags[]>;
  getOneById(id: TaskId, userId: TaskUserId): Promise<TaskWithTags | null>;
  update(task: Task): Promise<TaskWithTags>;
  delete(id: TaskId, userId: TaskUserId): Promise<void>;
  markAsCompleted(id: TaskId, userId: TaskUserId): Promise<TaskWithTags>;
  markAsIncomplete(id: TaskId, userId: TaskUserId): Promise<TaskWithTags>;
}
