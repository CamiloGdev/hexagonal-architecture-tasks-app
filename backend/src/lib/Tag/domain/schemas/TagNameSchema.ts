import { z } from 'zod';

export const TagNameSchema = z
  .string()
  .min(1, 'Tag name is required')
  .max(50, 'Tag name cannot exceed 50 characters')
  .trim();
