import { z } from 'zod';

export const TagUserIdSchema = z.uuid('Invalid user ID format');
