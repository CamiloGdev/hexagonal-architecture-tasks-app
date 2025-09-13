import { CategoryDateSchema } from './schemas/CategoryDateSchema';

export class CategoryUpdatedAt {
  readonly value: Date;

  constructor(value: Date) {
    const result = CategoryDateSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryUpdatedAt: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
