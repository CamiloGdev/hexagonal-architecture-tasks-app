import { z } from 'zod';
import { UserIdSchema } from './schemas/UserIdSchema';

export class UserId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const result = UserIdSchema.safeParse(this.value);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }
  }
}
