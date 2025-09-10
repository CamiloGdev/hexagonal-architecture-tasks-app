import { z } from 'zod';

export const ValidatePasswordSchema = z
  .string()
  .min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  .regex(/[A-Z]/, {
    message: 'La contraseña debe contener al menos una letra mayúscula',
  })
  .regex(/[a-z]/, {
    message: 'La contraseña debe contener al menos una letra minúscula',
  })
  .regex(/[0-9]/, {
    message: 'La contraseña debe contener al menos un número',
  })
  .regex(/[^A-Za-z0-9]/, {
    message: 'La contraseña debe contener al menos un símbolo especial',
  });

export type UserPasswordType = z.infer<typeof ValidatePasswordSchema>;
