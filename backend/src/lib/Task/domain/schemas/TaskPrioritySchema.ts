import { z } from 'zod';
import { Priority } from '../TaskPriority';

export const TaskPrioritySchema = z.enum(Priority);
