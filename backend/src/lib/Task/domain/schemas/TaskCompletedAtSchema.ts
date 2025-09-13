import { z } from 'zod';

export const TaskCompletedAtSchema = z.date().nullable();
