import { z } from 'zod';
import { Priority } from '../Priority.enum';

export const TaskPrioritySchema = z.enum(Priority);
