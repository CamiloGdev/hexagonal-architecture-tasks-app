import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { TaskNotFoundError } from '../domain/TaskNotFoundError';
import { TaskMapper } from './dtos/task.mapper';

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas del usuario
 */
export class ExpressTaskController {
  /**
   * @swagger
   * /tasks:
   *   get:
   *     summary: Obtener todas las tareas del usuario
   *     description: Retorna una lista de todas las tareas del usuario autenticado con filtros opcionales
   *     tags: [Tasks]
   *     parameters:
   *       - in: query
   *         name: completed
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado de completitud
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filtrar por ID de categoría
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [LOW, MEDIUM, HIGH]
   *         description: Filtrar por prioridad
   *       - in: query
   *         name: dueDateFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filtrar tareas con fecha límite desde esta fecha
   *       - in: query
   *         name: dueDateTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filtrar tareas con fecha límite hasta esta fecha
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar en título y descripción
   *       - in: query
   *         name: tags
   *         schema:
   *           type: string
   *         description: Filtrar por etiquetas (separadas por comas)
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [created_at, due_date, priority, title]
   *         description: Campo por el cual ordenar
   *       - in: query
   *         name: sortDirection
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         description: Dirección del ordenamiento
   *     responses:
   *       200:
   *         description: Lista de tareas obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // El middleware authMiddleware ya garantiza que req.user existe
      const userId = req.user?.id as string;

      // La validación y transformación ya la hizo el middleware validate
      // req.query ya tiene los tipos correctos
      const filters = req.query;

      const tasks = await ServiceContainer.task.getAll.execute({
        userId,
        filters,
      });

      return res.status(200).json(TaskMapper.toResponseDtoList(tasks));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   get:
   *     summary: Obtener una tarea específica por ID
   *     description: Retorna los detalles de una tarea específica del usuario autenticado
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea
   *     responses:
   *       200:
   *         description: Tarea encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async getOneById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const task = await ServiceContainer.task.getOneById.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(200).json(TaskMapper.toResponseDto(task));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Crear una nueva tarea
   *     description: Crea una nueva tarea para el usuario autenticado
   *     tags: [Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTaskRequest'
   *     responses:
   *       201:
   *         description: Tarea creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { title, description, priority, dueDate, categoryId, tagIds } =
        req.body;

      const createdTask = await ServiceContainer.task.create.execute({
        title,
        userId,
        description,
        priority,
        dueDate,
        categoryId,
        tagIds,
      });

      return res.status(201).json(TaskMapper.toResponseDto(createdTask));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   patch:
   *     summary: Actualizar una tarea existente
   *     description: Actualiza parcialmente los campos de una tarea existente del usuario autenticado
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTaskRequest'
   *     responses:
   *       200:
   *         description: Tarea actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const {
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      } = req.body;
      const taskId = req.params.id;

      const updatedTask = await ServiceContainer.task.update.execute({
        id: taskId as string,
        userId,
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      });

      return res.status(200).json(TaskMapper.toResponseDto(updatedTask));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   put:
   *     summary: Reemplazar completamente una tarea existente
   *     description: Reemplaza completamente una tarea existente con los datos proporcionados (PUT - reemplazo total)
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea a reemplazar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ReplaceTaskRequest'
   *     responses:
   *       200:
   *         description: Tarea reemplazada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async replace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const taskId = req.params.id;
      const {
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      } = req.body;

      const replacedTask = await ServiceContainer.task.replace.execute({
        id: taskId as string,
        userId,
        title,
        description,
        priority,
        completed,
        dueDate,
        categoryId,
        tagIds,
      });

      return res.status(200).json(TaskMapper.toResponseDto(replacedTask));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Eliminar una tarea
   *     description: Elimina permanentemente una tarea del usuario autenticado
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea a eliminar
   *     responses:
   *       204:
   *         description: Tarea eliminada exitosamente
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      await ServiceContainer.task.delete.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{id}/completar:
   *   patch:
   *     summary: Alternar estado de completitud de una tarea
   *     description: Cambia el estado de completitud de una tarea (completada/pendiente) y actualiza la fecha de completitud
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ToggleCompleteRequest'
   *     responses:
   *       200:
   *         description: Estado de completitud actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async toggleComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;

      const { completed } = req.body;
      const taskId = req.params.id;

      const updatedTask = await ServiceContainer.task.toggleComplete.execute({
        id: taskId as string,
        userId,
        completed,
      });

      return res.status(200).json(TaskMapper.toResponseDto(updatedTask));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}
