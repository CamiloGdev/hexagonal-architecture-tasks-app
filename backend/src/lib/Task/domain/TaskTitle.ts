import { TaskTitleSchema } from './schemas/TaskTitleSchema';

export class TaskTitle {
  readonly value: string;

  constructor(value: string) {
    const result = TaskTitleSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskTitle: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
