import type { Task } from '../../domain/Task';
import type { TaskResponseDto } from './task.response.dto';

export const TaskMapper = {
  toResponseDto(task: Task): TaskResponseDto {
    const dto: TaskResponseDto = {
      title: task.title.value,
      completed: task.completed.value,
      priority: task.priority.value,
      userId: task.userId.value,
    };

    if (task.id?.value) {
      dto.id = task.id.value;
    }

    if (task.description?.value) {
      dto.description = task.description.value;
    }

    if (task.dueDate?.value) {
      dto.dueDate = task.dueDate.value;
    }

    if (task.completedAt?.value) {
      dto.completedAt = task.completedAt.value;
    }

    if (task.categoryId?.value) {
      dto.categoryId = task.categoryId.value;
    }

    if (task.createdAt?.value) {
      dto.createdAt = task.createdAt.value;
    }

    if (task.updatedAt?.value) {
      dto.updatedAt = task.updatedAt.value;
    }

    return dto;
  },

  toResponseDtoList(tasks: Task[]): TaskResponseDto[] {
    return tasks.map(TaskMapper.toResponseDto);
  },
} as const;
