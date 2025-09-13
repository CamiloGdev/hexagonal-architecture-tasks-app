import { CategoryNameSchema } from './schemas/CategoryNameSchema';

export class CategoryName {
  readonly value: string;

  constructor(value: string) {
    const result = CategoryNameSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryName: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
