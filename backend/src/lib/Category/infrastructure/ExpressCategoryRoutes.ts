import { Router } from 'express';
import { authMiddleware } from '../../Shared/infrastructure/authMiddleware';
import { validate } from '../../Shared/infrastructure/validateRequest';
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from './category.schemas';
import type { ExpressCategoryController } from './ExpressCategoryController';

export function registerExpressCategoryRoutes(
  router: Router,
  categoryController: ExpressCategoryController,
): void {
  const categoryRouter = Router();

  // All category routes require authentication
  categoryRouter.use(authMiddleware);

  // GET /api/categories - Get all categories for the authenticated user
  categoryRouter.get('/', categoryController.getAll.bind(categoryController));

  // GET /api/categories/:id - Get a specific category by ID
  categoryRouter.get(
    '/:id',
    validate(categoryIdSchema),
    categoryController.getOneById.bind(categoryController),
  );

  // POST /api/categories - Create a new category
  categoryRouter.post(
    '/',
    validate(createCategorySchema),
    categoryController.create.bind(categoryController),
  );

  // PUT /api/categories/:id - Update a category
  categoryRouter.patch(
    '/:id',
    validate(updateCategorySchema),
    categoryController.update.bind(categoryController),
  );

  // DELETE /api/categories/:id - Delete a category
  categoryRouter.delete(
    '/:id',
    validate(categoryIdSchema),
    categoryController.delete.bind(categoryController),
  );

  router.use('/categories', categoryRouter);
}
