import { z } from 'zod';

/**
 * Esquema de validación para editar un usuario (PUT/PATCH)
 * Para PUT: todos los campos son requeridos
 * Para PATCH: todos los campos son opcionales
 */
export const editUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'must be at least 3 characters long' })
      .max(50, { message: 'must be at most 50 characters long' })
      .optional(),
    email: z.email({ message: 'must be a valid email address' }).optional(),
  }),
  params: z.object({
    id: z.string().min(1, { message: 'is required' }),
  }),
});

/**
 * Esquema de validación para PUT (requiere todos los campos)
 */
export const putUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'must be at least 3 characters long' })
      .max(50, { message: 'must be at most 50 characters long' }),
    email: z.email({ message: 'must be a valid email address' }),
  }),
  params: z.object({
    id: z.string().min(1, { message: 'is required' }),
  }),
});

/**
 * Esquema de validación para obtener un usuario por ID
 */
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: 'is required' }),
  }),
});

/**
 * Esquema de validación para crear un usuario
 */
export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, { message: 'must be at least 3 characters long' })
      .max(50, { message: 'must be at most 50 characters long' }),
    email: z.email({ message: 'must be a valid email address' }),
  }),
});
