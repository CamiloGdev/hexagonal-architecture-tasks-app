import type { Priority } from '../../domain/Priority.enum';

export type TaskResponseDto = {
  title: string;
  completed: boolean;
  priority: Priority;
  userId: string;
} & Partial<{
  id: string;
  description: string;
  dueDate: Date;
  completedAt: Date;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}>;
