import z from 'zod';
import { UserUpdatedAtSchema } from './schemas/UserUpdatedAtSchema';

export class UserUpdatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const result = UserUpdatedAtSchema.safeParse(this.value);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }
  }
}
