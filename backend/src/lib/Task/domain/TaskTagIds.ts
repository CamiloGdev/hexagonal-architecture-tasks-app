import z from 'zod';
import { TaskTagIdsSchema } from './schemas/TaskTagIdsSchema';

export class TaskTagIds {
  readonly value: string[];

  constructor(tagIds: string[]) {
    const result = TaskTagIdsSchema.safeParse(tagIds);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }

    this.value = result.data;
  }

  public isEmpty(): boolean {
    return this.value.length === 0;
  }

  public contains(tagId: string): boolean {
    return this.value.includes(tagId);
  }

  public add(tagId: string): TaskTagIds {
    if (this.contains(tagId)) {
      return this;
    }
    return new TaskTagIds([...this.value, tagId]);
  }

  public remove(tagId: string): TaskTagIds {
    return new TaskTagIds(this.value.filter((id) => id !== tagId));
  }

  public equals(other: TaskTagIds): boolean {
    if (this.value.length !== other.value.length) {
      return false;
    }

    const sortedThis = [...this.value].sort();
    const sortedOther = [...other.value].sort();

    return sortedThis.every((id, index) => id === sortedOther[index]);
  }
}
