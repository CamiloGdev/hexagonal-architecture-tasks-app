import { z } from 'zod';

export const CategoryUserIdSchema = z
  .uuid('User ID must be a valid UUID')
  .nonempty('User ID cannot be empty');
