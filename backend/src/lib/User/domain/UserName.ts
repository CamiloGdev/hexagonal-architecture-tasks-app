import { z } from 'zod';
import { UserNameSchema } from './schemas/UserNameSchema';

export class UserName {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const result = UserNameSchema.safeParse(this.value);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const errors = formattedErrors.errors.join(', ');
      throw new Error(errors);
    }
  }
}
