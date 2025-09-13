import { CategoryDateSchema } from './schemas/CategoryDateSchema';

export class CategoryCreatedAt {
  readonly value: Date;

  constructor(value: Date) {
    const result = CategoryDateSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryCreatedAt: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
