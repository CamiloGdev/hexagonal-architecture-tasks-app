import { z } from 'zod';

// Schema for category ID parameter validation
export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Category ID must be a valid UUID'),
  }),
});

// Schema for creating a new category
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name is required')
      .max(50, 'Category name cannot exceed 50 characters')
      .trim(),
    color: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Color must be a valid hex color format (#RRGGBB or #RGB)',
      )
      .optional(),
  }),
});

// Schema for updating a category
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Category ID must be a valid UUID'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name is required')
      .max(50, 'Category name cannot exceed 50 characters')
      .trim()
      .optional(),
    color: z
      .string()
      .regex(
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Color must be a valid hex color format (#RRGGBB or #RGB)',
      )
      .optional(),
  }),
});

// Type exports for TypeScript
export type CategoryIdParams = z.infer<typeof categoryIdSchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
