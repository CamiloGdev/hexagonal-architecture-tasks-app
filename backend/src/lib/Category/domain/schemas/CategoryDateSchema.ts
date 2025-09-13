import { z } from 'zod';

export const CategoryDateSchema = z.date()
  .refine(
    (date) => !Number.isNaN(date.getTime()),
    { message: 'Invalid date format' }
  );
