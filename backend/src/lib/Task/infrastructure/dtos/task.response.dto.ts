import type { Priority } from '../../domain/Priority.enum';

export type TagDto = {
  id: string;
  name: string;
  color?: string;
};

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
  tags: TagDto[];
  createdAt: Date;
  updatedAt: Date;
}>;
