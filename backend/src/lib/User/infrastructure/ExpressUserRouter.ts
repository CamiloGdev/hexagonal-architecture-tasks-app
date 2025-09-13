import { Router } from 'express';
import { authMiddleware } from '../../Shared/infrastructure/authMiddleware';
import { validate } from '../../Shared/infrastructure/validateRequest';
import type { ExpressUserController } from './ExpressUserController';
import { editUserSchema, putUserSchema, userIdSchema } from './user.schemas';

export function registerExpressUserRoutes(
  router: Router,
  userController: ExpressUserController,
): void {
  const userRouter = Router();

  /* userRouter.get(
    '/',
    validate(userIdSchema),
    userController.getAll.bind(userController),
  ); */
  userRouter.get(
    '/:id',
    validate(userIdSchema),
    userController.getOneById.bind(userController),
  );
  /* userRouter.post(
    '/',
    validate(putUserSchema),
    userController.create.bind(userController),
  ); */
  userRouter.put(
    '/:id',
    authMiddleware, // Middleware de protección
    validate(putUserSchema),
    userController.edit.bind(userController),
  );
  userRouter.patch(
    '/:id',
    authMiddleware, // Middleware de protección
    validate(editUserSchema),
    userController.edit.bind(userController),
  );
  /* userRouter.delete(
    '/:id',
    validate(userIdSchema),
    userController.delete.bind(userController),
  ); */

  router.use('/users', userRouter);
}
