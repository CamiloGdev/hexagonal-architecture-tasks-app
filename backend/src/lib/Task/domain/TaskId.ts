import { TaskIdSchema } from './schemas/TaskIdSchema';

export class TaskId {
  readonly value: string;

  constructor(value: string) {
    const result = TaskIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskId: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
