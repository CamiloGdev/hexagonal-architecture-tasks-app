import { z } from 'zod';

export const UserIdSchema = z.string().min(5, {
  message: 'UserId must be at least 5 characters long',
});

export type UserIdType = z.infer<typeof UserIdSchema>;
