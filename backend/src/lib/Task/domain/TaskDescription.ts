import { TaskDescriptionSchema } from './schemas/TaskDescriptionSchema';

export class TaskDescription {
  readonly value: string | null;

  constructor(value: string | null) {
    const result = TaskDescriptionSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TaskDescription: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
