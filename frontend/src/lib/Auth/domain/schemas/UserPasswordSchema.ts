import { z } from 'zod';

/**
 * User Password Schema - Aligned with backend ValidatePasswordSchema
 *
 * Validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (non-alphanumeric)
 *
 * This schema is the single source of truth for password validation
 * and is aligned with the backend ValidatePasswordSchema.
 */
export const UserPasswordSchema = z
  .string()
  .min(8, {
    message: 'Password must be at least 8 characters long',
  })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  .regex(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  });

export type UserPasswordType = z.infer<typeof UserPasswordSchema>;
