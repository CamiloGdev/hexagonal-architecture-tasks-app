import { z } from 'zod';

export const TaskTitleSchema = z.string().min(1).max(255);
