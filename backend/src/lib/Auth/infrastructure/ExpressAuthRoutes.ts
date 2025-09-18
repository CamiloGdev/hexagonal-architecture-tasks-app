import { Router } from 'express';
import { authMiddleware } from '../../Shared/infrastructure/authMiddleware';
import { validate } from '../../Shared/infrastructure/validateRequest';
import { loginSchema, registerSchema } from './auth.schemas';
import type { ExpressAuthController } from './ExpressAuthController';

export function registerExpressAuthRoutes(
  router: Router,
  authController: ExpressAuthController,
): void {
  const authRouter = Router();

  // Rutas de autenticación con validación
  authRouter.post(
    '/register',
    validate(registerSchema),
    authController.register.bind(authController),
  );
  authRouter.post(
    '/login',
    validate(loginSchema),
    authController.login.bind(authController),
  );

  // Ruta para refrescar el token de acceso
  authRouter.post('/refresh', authController.refresh.bind(authController));

  // Ruta para logout
  authRouter.post('/logout', authController.logout.bind(authController));

  // Ruta para obtener el perfil del usuario autenticado
  authRouter.get(
    '/profile',
    authMiddleware,
    authController.getProfile.bind(authController),
  );

  // Registrar las rutas de autenticación en el router principal
  router.use('/auth', authRouter);
}
