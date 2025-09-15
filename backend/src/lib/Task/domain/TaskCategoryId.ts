import { TaskCategoryIdSchema } from './schemas/TaskCategoryIdSchema';

export class TaskCategoryId {
  readonly value: string;

  constructor(value: string) {
    const result = TaskCategoryIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskCategoryId: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
