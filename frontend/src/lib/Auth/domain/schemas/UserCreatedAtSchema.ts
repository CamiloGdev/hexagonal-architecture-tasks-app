import { z } from 'zod';

/**
 * User CreatedAt Schema - Aligned with backend UserCreatedAtSchema
 *
 * Validation rules:
 * - Date type required
 * - Represents when the user was created
 *
 * This schema is the single source of truth for user createdAt validation
 * and is aligned with the backend UserCreatedAtSchema.
 */
export const UserCreatedAtSchema = z.date({
  message: 'CreatedAt must be a valid date',
});

export type UserCreatedAtType = z.infer<typeof UserCreatedAtSchema>;
