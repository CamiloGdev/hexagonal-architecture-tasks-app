import { CategoryIdSchema } from './schemas/CategoryIdSchema';

export class CategoryId {
  readonly value: string;

  constructor(value: string) {
    const result = CategoryIdSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryId: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
