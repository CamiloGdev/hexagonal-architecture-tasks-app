import { z } from 'zod';

/**
 * User ID Schema - Aligned with backend UserIdSchema
 *
 * Validation rules:
 * - UUID format (v4)
 * - String type required
 *
 * This schema is the single source of truth for user ID validation
 * and is aligned with the backend UserIdSchema.
 */
export const UserIdSchema = z.uuid({
  message: 'User ID must be a valid UUID',
});

export type UserIdType = z.infer<typeof UserIdSchema>;
