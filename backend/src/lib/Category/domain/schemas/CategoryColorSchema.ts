import { z } from 'zod';

export const CategoryColorSchema = z
  .string()
  .regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Category color must be a valid hex color format (#RRGGBB or #RGB)',
  )
  .nullable();
