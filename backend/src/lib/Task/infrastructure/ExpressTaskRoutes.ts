import { Router } from 'express';
import { authMiddleware } from '../../Shared/infrastructure/authMiddleware';
import { validate } from '../../Shared/infrastructure/validateRequest';
import type { ExpressTaskController } from './ExpressTaskController';
import {
  createTaskSchema,
  patchTaskSchema,
  putTaskSchema,
  taskIdSchema,
  taskQuerySchema,
  toggleCompleteTaskSchema,
} from './task.schemas';

export function registerExpressTaskRoutes(
  router: Router,
  taskController: ExpressTaskController,
): void {
  const taskRouter = Router();

  // All task routes require authentication
  taskRouter.use(authMiddleware);

  // GET /api/tasks - Get all tasks with optional filters
  taskRouter.get(
    '/',
    validate(taskQuerySchema),
    taskController.getAll.bind(taskController),
  );

  // GET /api/tasks/:id - Get a specific task by ID
  taskRouter.get(
    '/:id',
    validate(taskIdSchema),
    taskController.getOneById.bind(taskController),
  );

  // POST /api/tasks - Create a new task
  taskRouter.post(
    '/',
    validate(createTaskSchema),
    taskController.create.bind(taskController),
  );

  // PUT /api/tasks/:id - Completely replace a task
  taskRouter.put(
    '/:id',
    validate(putTaskSchema),
    taskController.replace.bind(taskController),
  );

  // PATCH /api/tasks/:id - Partially update a task
  taskRouter.patch(
    '/:id',
    validate(patchTaskSchema),
    taskController.update.bind(taskController),
  );

  // DELETE /api/tasks/:id - Delete a task
  taskRouter.delete(
    '/:id',
    validate(taskIdSchema),
    taskController.delete.bind(taskController),
  );

  // PATCH /api/tasks/:id/completar - Toggle task completion status
  taskRouter.patch(
    '/:id/completar',
    validate(toggleCompleteTaskSchema),
    taskController.toggleComplete.bind(taskController),
  );

  router.use('/tasks', taskRouter);
}
