import { z } from 'zod';
import { Priority } from '../domain/Priority.enum';
import { TaskTagIdsSchema } from '../domain/schemas/TaskTagIdsSchema';

/**
 * Schema for creating a new task
 */
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(255, { message: 'Title must be at most 255 characters long' }),
    description: z
      .string()
      .max(1000, {
        message: 'Description must be at most 1000 characters long',
      })
      .optional(),
    priority: z.enum(Priority).optional(),
    dueDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    // categoryId: z.uuid().optional(),
    categoryId: z.uuid({
      message: 'Category ID is required and must be a valid UUID',
    }),
    tagIds: TaskTagIdsSchema,
  }),
});

/**
 * Schema for updating a task (PUT - all fields required)
 */
export const putTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(255, { message: 'Title must be at most 255 characters long' }),
    description: z
      .string()
      .max(1000, {
        message: 'Description must be at most 1000 characters long',
      })
      .optional(),
    priority: z.enum(Priority),
    completed: z.boolean(),
    dueDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    categoryId: z.uuid().optional(),
    tagIds: TaskTagIdsSchema,
  }),
  params: z.object({
    id: z.uuid({ message: 'Invalid task ID format' }),
  }),
});

/**
 * Schema for updating a task (PATCH - all fields optional)
 */
export const patchTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, { message: 'Title is required' })
      .max(255, { message: 'Title must be at most 255 characters long' })
      .optional(),
    description: z
      .string()
      .max(1000, {
        message: 'Description must be at most 1000 characters long',
      })
      .optional(),
    priority: z.enum(Priority).optional(),
    completed: z.boolean().optional(),
    dueDate: z.iso
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    categoryId: z.uuid().optional(),
    tagIds: TaskTagIdsSchema,
  }),
  params: z.object({
    id: z.uuid({ message: 'Invalid task ID format' }),
  }),
});

/**
 * Schema for task ID parameter validation
 */
export const taskIdSchema = z.object({
  params: z.object({
    id: z.uuid({ message: 'Invalid task ID format' }),
  }),
});

/**
 * Schema for toggling task completion status
 */
export const toggleCompleteTaskSchema = z.object({
  body: z.object({
    completed: z.boolean(),
  }),
  params: z.object({
    id: z.uuid({ message: 'Invalid task ID format' }),
  }),
});

/**
 * Schema for task filtering and querying
 */
export const taskQuerySchema = z.object({
  query: z
    .object({
      completed: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
      categoryId: z.uuid().optional(),
      priority: z.enum(Priority).optional(),
      dueDateFrom: z.iso
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      dueDateTo: z.iso
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
      search: z.string().optional(),
      tags: z
        .string()
        .transform((val) => val.split(','))
        .optional(),
      sortBy: z
        .enum(['created_at', 'due_date', 'priority', 'title'])
        .optional(),
      sortDirection: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
});
