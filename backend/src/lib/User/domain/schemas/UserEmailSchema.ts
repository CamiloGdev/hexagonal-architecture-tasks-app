import { z } from 'zod';

export const UserEmailSchema = z.email({
  message: 'UserEmail must be a valid email address',
});

export type UserEmailType = z.infer<typeof UserEmailSchema>;
