import { z } from 'zod';

export const TagCreatedAtSchema = z
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: 'Invalid date format',
  });
export const TagUpdatedAtSchema = z
  .date()
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: 'Invalid date format',
  });
