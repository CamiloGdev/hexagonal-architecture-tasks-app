import { z } from 'zod';

export const CategoryIdSchema = z
  .uuid('Category ID must be a valid UUID')
  .nonempty('Category ID cannot be empty');
