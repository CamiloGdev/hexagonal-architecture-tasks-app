import { TaskDueDateSchema } from './schemas/TaskDueDateSchema';

export class TaskDueDate {
  readonly value: Date | null;

  constructor(value: Date | null) {
    const result = TaskDueDateSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskDueDate: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
