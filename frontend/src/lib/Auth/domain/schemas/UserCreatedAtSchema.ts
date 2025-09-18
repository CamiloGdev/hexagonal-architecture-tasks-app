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
export const UserCreatedAtSchema = z
  .date()
  .refine((date) => date <= new Date(), {
    message: 'CreatedAt must be a valid datetime string',
  });

export type UserCreatedAtType = z.infer<typeof UserCreatedAtSchema>;
