import { TaskCompletedAtSchema } from './schemas/TaskCompletedAtSchema';

export class TaskCompletedAt {
  readonly value: Date | null;

  constructor(value: Date | null) {
    const result = TaskCompletedAtSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskCompletedAt: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
