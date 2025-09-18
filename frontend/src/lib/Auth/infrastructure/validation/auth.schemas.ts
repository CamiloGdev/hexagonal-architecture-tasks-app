import { z } from 'zod';
// 🎯 Import domain schemas - Single Source of Truth
import {
  UserEmailSchema,
  UserNameSchema,
  UserPasswordSchema,
} from '../../domain/User';

// 🔐 Login form validation schema
// Reuses domain schemas for email validation
// Password validation is simplified for login (just required)
export const loginSchema = z.object({
  email: UserEmailSchema, // ✨ Reusing domain email validation
  password: z.string().min(1, 'Password is required'), // Simplified for login
});

// 📝 Register form validation schema
// Reuses ALL domain validation rules + adds UI-specific confirmPassword
export const registerSchema = z
  .object({
    name: UserNameSchema, // ✨ Reusing domain name validation
    email: UserEmailSchema, // ✨ Reusing domain email validation
    password: UserPasswordSchema, // ✨ Reusing domain password validation (full rules)
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // UI-specific error path
  });

// 🏷️ Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
