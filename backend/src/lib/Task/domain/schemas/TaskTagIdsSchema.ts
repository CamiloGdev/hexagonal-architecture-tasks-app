import { z } from 'zod';

export const TaskTagIdsSchema = z
  .array(z.uuid('Invalid tag ID format'))
  .optional()
  .default([])
  .transform((tagIds) => [...new Set(tagIds.filter((id) => id.trim() !== ''))]);
