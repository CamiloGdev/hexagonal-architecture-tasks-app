import { z } from 'zod';

export const TagUserIdSchema = z.string().uuid('Invalid user ID format');
