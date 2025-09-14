import type { Task } from '../../domain/Task';
import type { TaskWithTags } from '../../domain/TaskRepository';
import type { TagDto, TaskResponseDto } from './task.response.dto';

export const TaskMapper = {
  toResponseDto(
    taskWithTags: TaskWithTags | Task,
    tags?: TagDto[],
  ): TaskResponseDto {
    // Si recibimos un TaskWithTags, extraemos la tarea y los tags
    let task: Task;
    let taskTags: TagDto[] | undefined = tags;

    if ('task' in taskWithTags && 'tags' in taskWithTags) {
      task = taskWithTags.task;
      // Convertimos TagInfo a TagDto (son estructuralmente idénticos)
      taskTags = taskWithTags.tags as TagDto[];
    } else {
      task = taskWithTags;
    }
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

    // Map tags if they are provided
    if (taskTags && taskTags.length > 0) {
      dto.tags = taskTags;
    }

    return dto;
  },

  toResponseDtoList(tasksWithTags: TaskWithTags[]): TaskResponseDto[] {
    return tasksWithTags.map((taskWithTags) => {
      return TaskMapper.toResponseDto(taskWithTags);
    });
  },
} as const;
