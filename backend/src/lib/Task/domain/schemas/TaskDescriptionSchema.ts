import { z } from 'zod';

export const TaskDescriptionSchema = z.string().max(1000).nullable();
