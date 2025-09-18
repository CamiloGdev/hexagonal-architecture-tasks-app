import { z } from 'zod';

/**
 * User UpdatedAt Schema - Aligned with backend UserUpdatedAtSchema
 *
 * Validation rules:
 * - Date type required
 * - Represents when the user was last updated
 *
 * This schema is the single source of truth for user updatedAt validation
 * and is aligned with the backend UserUpdatedAtSchema.
 */
export const UserUpdatedAtSchema = z.date({
  message: 'UpdatedAt must be a valid date',
});

export type UserUpdatedAtType = z.infer<typeof UserUpdatedAtSchema>;
