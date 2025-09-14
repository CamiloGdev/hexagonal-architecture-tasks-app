import { z } from 'zod';

// Schema for tag ID parameter validation
export const tagIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Tag ID must be a valid UUID'),
  }),
});

// Schema for creating a new tag
export const createTagSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name is required')
      .max(50, 'Tag name cannot exceed 50 characters')
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

// Schema for updating a tag
export const updateTagSchema = z.object({
  params: z.object({
    id: z.string().uuid('Tag ID must be a valid UUID'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name is required')
      .max(50, 'Tag name cannot exceed 50 characters')
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

// Schema for task ID parameter validation
export const taskIdSchema = z.object({
  params: z.object({
    taskId: z.string().uuid('Task ID must be a valid UUID'),
  }),
});

// Schema for tag-task assignment
export const assignTagToTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Tag ID must be a valid UUID'),
    taskId: z.string().uuid('Task ID must be a valid UUID'),
  }),
});

// Type exports for TypeScript
export type TagIdParams = z.infer<typeof tagIdSchema>;
export type CreateTagBody = z.infer<typeof createTagSchema>;
export type UpdateTagRequest = z.infer<typeof updateTagSchema>;
export type TaskIdParams = z.infer<typeof taskIdSchema>;
export type AssignTagToTaskParams = z.infer<typeof assignTagToTaskSchema>;
