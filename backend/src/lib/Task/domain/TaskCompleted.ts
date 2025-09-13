import { TaskCompletedSchema } from './schemas/TaskCompletedSchema';

export class TaskCompleted {
  readonly value: boolean;

  constructor(value: boolean) {
    const result = TaskCompletedSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskCompleted: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
