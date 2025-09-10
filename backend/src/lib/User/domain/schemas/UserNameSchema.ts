import { z } from 'zod';

export const UserNameSchema = z.string().min(3, {
  message: 'UserName must be at least 3 characters long',
});

export type UserNameType = z.infer<typeof UserNameSchema>;
