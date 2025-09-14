import { z } from 'zod';

export const TagIdSchema = z.string().uuid('Invalid tag ID format');
