import { z } from 'zod';

export const CategoryNameSchema = z
  .string()
  .min(1, 'Category name cannot be empty')
  .max(50, 'Category name cannot exceed 50 characters')
  .trim();
