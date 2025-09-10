import { z } from 'zod';

export const UserUpdatedAtSchema = z
  .date()
  .refine((date) => date <= new Date(), {
    message: 'UserUpdatedAt must be in the past',
  });

export type UserUpdatedAtType = z.infer<typeof UserUpdatedAtSchema>;
