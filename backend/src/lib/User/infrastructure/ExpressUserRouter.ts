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
    '/users/',
    validate(userIdSchema),
    userController.getAll.bind(userController),
  ); */
  userRouter.get(
    '/users/:id/',
    validate(userIdSchema),
    userController.getOneById.bind(userController),
  );
  /* userRouter.post(
    '/users/',
    validate(putUserSchema),
    userController.create.bind(userController),
  ); */
  userRouter.put(
    '/users/:id',
    authMiddleware, // Middleware de protección
    validate(putUserSchema),
    userController.edit.bind(userController),
  );
  userRouter.patch(
    '/users/:id',
    authMiddleware, // Middleware de protección
    validate(editUserSchema),
    userController.edit.bind(userController),
  );
  /* userRouter.delete(
    '/users/:id',
    validate(userIdSchema),
    userController.delete.bind(userController),
  ); */

  router.use('/users', userRouter);
}
