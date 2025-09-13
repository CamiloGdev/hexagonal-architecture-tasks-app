import { CategoryUserIdSchema } from './schemas/CategoryUserIdSchema';

export class CategoryUserId {
  readonly value: string;

  constructor(value: string) {
    const result = CategoryUserIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryUserId: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
