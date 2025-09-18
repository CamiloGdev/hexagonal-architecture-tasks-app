import { z } from 'zod';

/**
 * User Email Schema - Aligned with backend UserEmailSchema
 *
 * Validation rules:
 * - Valid email format
 * - Automatic lowercase transformation
 *
 * This schema is the single source of truth for user email validation
 * and is aligned with the backend UserEmailSchema.
 */
export const UserEmailSchema = z
  .email({
    message: 'Must be a valid email address',
  })
  .toLowerCase();

export type UserEmailType = z.infer<typeof UserEmailSchema>;
