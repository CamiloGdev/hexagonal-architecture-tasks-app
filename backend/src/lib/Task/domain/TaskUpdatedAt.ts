import { TaskUpdatedAtSchema } from './schemas/TaskUpdatedAtSchema';

export class TaskUpdatedAt {
  readonly value: Date;

  constructor(value: Date) {
    const result = TaskUpdatedAtSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskUpdatedAt: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
