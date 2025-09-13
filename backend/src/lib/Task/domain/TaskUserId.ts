import { TaskUserIdSchema } from './schemas/TaskUserIdSchema';

export class TaskUserId {
  readonly value: string;

  constructor(value: string) {
    const result = TaskUserIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskUserId: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
