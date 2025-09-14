import { Router } from 'express';
import { authMiddleware } from '../../Shared/infrastructure/authMiddleware';
import { validate } from '../../Shared/infrastructure/validateRequest';
import type { ExpressTagController } from './ExpressTagController';
import {
  // assignTagToTaskSchema,
  createTagSchema,
  tagIdSchema,
  // taskIdSchema,
  updateTagSchema,
} from './tag.schemas';

export function registerExpressTagRoutes(
  router: Router,
  tagController: ExpressTagController,
): void {
  const tagRouter = Router();

  // All tag routes require authentication
  tagRouter.use(authMiddleware);

  // GET /api/tags - Get all tags for the authenticated user
  tagRouter.get('/', tagController.getAll.bind(tagController));

  // GET /api/tags/:id - Get a specific tag by ID
  /* tagRouter.get(
    '/:id',
    validate(tagIdSchema),
    tagController.getOneById.bind(tagController),
  ); */

  // POST /api/tags - Create a new tag
  tagRouter.post(
    '/',
    validate(createTagSchema),
    tagController.create.bind(tagController),
  );

  // PATCH /api/tags/:id - Update a tag
  tagRouter.patch(
    '/:id',
    validate(updateTagSchema),
    tagController.update.bind(tagController),
  );

  // DELETE /api/tags/:id - Delete a tag
  tagRouter.delete(
    '/:id',
    validate(tagIdSchema),
    tagController.delete.bind(tagController),
  );

  // GET /api/tags/task/:taskId - Get all tags for a specific task
  /* tagRouter.get(
    '/task/:taskId',
    validate(taskIdSchema),
    tagController.getByTaskId.bind(tagController),
  ); */

  // POST /api/tags/:id/assign/:taskId - Assign a tag to a task
  /* tagRouter.post(
    '/:id/assign/:taskId',
    validate(assignTagToTaskSchema),
    tagController.assignToTask.bind(tagController),
  ); */

  // DELETE /api/tags/:id/assign/:taskId - Unassign a tag from a task
  /* tagRouter.delete(
    '/:id/assign/:taskId',
    validate(assignTagToTaskSchema),
    tagController.unassignFromTask.bind(tagController),
  ); */

  router.use('/tags', tagRouter);
}
