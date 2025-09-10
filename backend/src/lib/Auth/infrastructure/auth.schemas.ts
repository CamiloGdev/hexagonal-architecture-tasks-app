import { z } from 'zod';
import { ValidatePasswordSchema } from './ValidatePasswordSchema';

/**
 * Esquema de validación para el registro de usuarios
 * Valida que los campos requeridos estén presentes y tengan el formato correcto
 * Utiliza el esquema de contraseña del dominio para validación completa
 */
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'must be at least 3 characters long' })
      .max(50, { message: 'must be at most 50 characters long' }),
    email: z.email({ message: 'must be a valid email address' }),
    password: ValidatePasswordSchema,
  }),
});

/**
 * Esquema de validación para el login de usuarios
 * Valida que email y password estén presentes
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'must be a valid email address' }),
    password: z.string().min(1, { message: 'is required' }),
  }),
});
