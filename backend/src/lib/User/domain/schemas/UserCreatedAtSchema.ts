import { z } from 'zod';

export const UserCreatedAtSchema = z
  .date()
  .refine((date) => date <= new Date(), {
    message: 'UserCreatedAt must be in the past',
  });

export type UserCreatedAtType = z.infer<typeof UserCreatedAtSchema>;
