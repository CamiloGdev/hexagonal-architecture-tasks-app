import type { Priority } from './Priority.enum';
import { TaskPrioritySchema } from './schemas/TaskPrioritySchema';

export class TaskPriority {
  readonly value: Priority;

  constructor(value: Priority) {
    const result = TaskPrioritySchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskPriority: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
