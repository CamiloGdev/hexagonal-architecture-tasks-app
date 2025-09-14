import { z } from 'zod';

export const TagColorSchema = z
  .string()
  .regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Tag color must be a valid hex color (e.g., #FF5733 or #F53)',
  )
  .optional();
