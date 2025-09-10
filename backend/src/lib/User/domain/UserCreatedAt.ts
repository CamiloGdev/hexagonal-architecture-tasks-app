import z from 'zod';
import { UserCreatedAtSchema } from './schemas/UserCreatedAtSchema';

export class UserCreatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const result = UserCreatedAtSchema.safeParse(this.value);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }
  }
}
