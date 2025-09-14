import { TagNameSchema } from './schemas/TagNameSchema';

export class TagName {
  readonly value: string;

  constructor(value: string) {
    const result = TagNameSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid TagName: ${result.error.message}`);
    }
    this.value = result.data;
  }
}
