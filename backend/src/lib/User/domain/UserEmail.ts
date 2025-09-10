import { z } from 'zod';
import { UserEmailSchema } from './schemas/UserEmailSchema';

export class UserEmail {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const result = UserEmailSchema.safeParse(this.value);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }
  }
}
