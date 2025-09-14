import { z } from 'zod';

export const UserIdSchema = z
  .uuid('UserId must be a valid UUID')
  .nonempty('UserId cannot be empty');

export type UserIdType = z.infer<typeof UserIdSchema>;
