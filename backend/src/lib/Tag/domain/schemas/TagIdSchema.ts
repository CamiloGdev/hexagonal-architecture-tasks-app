import { z } from 'zod';

export const TagIdSchema = z.uuid('Invalid tag ID format');
