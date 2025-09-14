import { TagColorSchema } from './schemas/TagColorSchema';

export class TagColor {
  readonly value: string;

  constructor(value: string) {
    const result = TagColorSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TagColor: ${result.error.message}`);
    }
    this.value = result.data;
  }

  public equals(other: TagColor): boolean {
    return this.value === other.value;
  }
}
