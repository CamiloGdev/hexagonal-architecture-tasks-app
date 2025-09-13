import { z } from 'zod';

export const TaskDueDateSchema = z.date().nullable();
