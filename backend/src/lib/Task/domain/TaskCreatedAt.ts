import { TaskCreatedAtSchema } from './schemas/TaskCreatedAtSchema';

export class TaskCreatedAt {
  readonly value: Date;

  constructor(value: Date) {
    const result = TaskCreatedAtSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskCreatedAt: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
