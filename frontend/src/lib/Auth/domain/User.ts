import { z } from 'zod';

// 🎯 Import modular schemas - Following backend pattern
import {
  UserCreatedAtSchema,
  UserEmailSchema,
  UserIdSchema,
  UserNameSchema,
  UserPasswordSchema,
  UserUpdatedAtSchema,
} from './schemas';

// Re-export schemas for external use
export {
  UserNameSchema,
  UserEmailSchema,
  UserPasswordSchema,
  UserIdSchema,
  UserCreatedAtSchema,
  UserUpdatedAtSchema,
};

/**
 * Complete User Entity Schema
 * Represents the core User domain entity using modular schemas
 */
export const userSchema = z.object({
  id: UserIdSchema.optional(),
  name: UserNameSchema,
  email: UserEmailSchema,
  createdAt: UserCreatedAtSchema.optional(),
  updatedAt: UserUpdatedAtSchema.optional(),
});

// 🏷️ Type Inference from Schemas
export type User = z.infer<typeof userSchema>;

/**
 * AuthUser - A User that is guaranteed to have id and timestamps
 * Used when we know the user is authenticated and persisted
 */
export type AuthUser = Required<User>;

// 🔍 Validation Functions (pure functions for domain logic)
// These use the modular schemas internally for consistency

export const isValidEmail = (email: string): boolean => {
  return UserEmailSchema.safeParse(email).success;
};

export const isValidName = (name: string): boolean => {
  return UserNameSchema.safeParse(name).success;
};

export const isValidPassword = (password: string): boolean => {
  return UserPasswordSchema.safeParse(password).success;
};

// 🛡️ Ensure Functions (throw errors for invalid data)
// These provide the same API as before but use modular Zod schemas internally

export const ensureEmailIsValid = (email: string): void => {
  const result = UserEmailSchema.safeParse(email);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError.message);
  }
};

export const ensureNameIsValid = (name: string): void => {
  const result = UserNameSchema.safeParse(name);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError.message);
  }
};

export const ensurePasswordIsValid = (password: string): void => {
  const result = UserPasswordSchema.safeParse(password);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError.message);
  }
};

/**
 * Validates a complete User entity
 * @param user - The user object to validate
 * @throws Error if validation fails
 */
export const ensureUserIsValid = (user: unknown): asserts user is User => {
  const result = userSchema.safeParse(user);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(
      `User validation failed: ${firstError.path.join('.')} - ${firstError.message}`,
    );
  }
};
