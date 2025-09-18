import { z } from 'zod';

/**
 * User Name Schema - Aligned with backend UserNameSchema
 *
 * Validation rules:
 * - Minimum 3 characters
 * - String type required
 *
 * This schema is the single source of truth for user name validation
 * and is aligned with the backend UserNameSchema.
 */
export const UserNameSchema = z.string().min(3, {
  message: 'Name must be at least 3 characters long',
});

export type UserNameType = z.infer<typeof UserNameSchema>;
