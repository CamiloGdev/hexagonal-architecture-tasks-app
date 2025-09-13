import { CategoryColorSchema } from './schemas/CategoryColorSchema';

export class CategoryColor {
  readonly value: string | null;

  constructor(value: string | null) {
    const result = CategoryColorSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid CategoryColor: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
