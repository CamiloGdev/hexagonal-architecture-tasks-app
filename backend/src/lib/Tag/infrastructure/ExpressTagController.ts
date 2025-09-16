import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { TagNotFoundError } from '../domain/TagNotFoundError';
import { TagMapper } from './dtos/tag.mapper';

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Gestión de etiquetas del usuario
 */
export class ExpressTagController {
  /**
   * @swagger
   * /tags:
   *   get:
   *     summary: Obtener todas las etiquetas del usuario
   *     description: Retorna una lista de todas las etiquetas del usuario autenticado
   *     tags: [Tags]
   *     responses:
   *       200:
   *         description: Lista de etiquetas obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Tag'
   *             example:
   *               - id: "123e4567-e89b-12d3-a456-426614174000"
   *                 name: "Urgente"
   *                 color: "#FF5733"
   *                 userId: "456e7890-e89b-12d3-a456-426614174001"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *               - id: "789e0123-e89b-12d3-a456-426614174002"
   *                 name: "Importante"
   *                 color: "#FFC300"
   *                 userId: "456e7890-e89b-12d3-a456-426614174001"
   *                 createdAt: "2024-01-02T00:00:00.000Z"
   *                 updatedAt: "2024-01-02T00:00:00.000Z"
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

      const tags = await ServiceContainer.tag.getAll.run(userId);

      return res.status(200).json(TagMapper.toResponseDtoList(tags));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /tags/{id}:
   *   get:
   *     summary: Obtener una etiqueta específica por ID
   *     description: Retorna los detalles de una etiqueta específica del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la etiqueta
   *     responses:
   *       200:
   *         description: Etiqueta encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tag'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Urgente"
   *               color: "#FF5733"
   *               userId: "456e7890-e89b-12d3-a456-426614174001"
   *               createdAt: "2024-01-01T00:00:00.000Z"
   *               updatedAt: "2024-01-01T00:00:00.000Z"
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Etiqueta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Tag not found"
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

      const tag = await ServiceContainer.tag.getOneById.run(
        req.params.id as string,
        userId,
      );

      return res.status(200).json(TagMapper.toResponseDto(tag));
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tags:
   *   post:
   *     summary: Crear una nueva etiqueta
   *     description: Crea una nueva etiqueta para el usuario autenticado
   *     tags: [Tags]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTagRequest'
   *     responses:
   *       201:
   *         description: Etiqueta creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tag'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Urgente"
   *               color: "#FF5733"
   *               userId: "456e7890-e89b-12d3-a456-426614174001"
   *               createdAt: "2024-01-01T00:00:00.000Z"
   *               updatedAt: "2024-01-01T00:00:00.000Z"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *             example:
   *               error: "Invalid request data"
   *               details:
   *                 - field: "body.name"
   *                   message: "body.name Tag name is required"
   *                 - field: "body.color"
   *                   message: "body.color Color must be a valid hex color format (#RRGGBB or #RGB)"
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

      const { name, color } = req.body;

      const createdTag = await ServiceContainer.tag.create.run(
        name,
        userId,
        color,
      );

      return res.status(201).json(TagMapper.toResponseDto(createdTag));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /tags/{id}:
   *   patch:
   *     summary: Actualizar una etiqueta existente
   *     description: Actualiza parcialmente los campos de una etiqueta existente del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la etiqueta a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateTagRequest'
   *     responses:
   *       200:
   *         description: Etiqueta actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tag'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Muy Urgente"
   *               color: "#E74C3C"
   *               userId: "456e7890-e89b-12d3-a456-426614174001"
   *               createdAt: "2024-01-01T00:00:00.000Z"
   *               updatedAt: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationErrorResponse'
   *             example:
   *               error: "Invalid request data"
   *               details:
   *                 - field: "params.id"
   *                   message: "params.id Tag ID must be a valid UUID"
   *                 - field: "body.name"
   *                   message: "body.name Tag name cannot exceed 50 characters"
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Etiqueta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Tag not found"
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

      const { name, color } = req.body;
      const tagId = req.params.id;

      await ServiceContainer.tag.update.run(
        tagId as string,
        userId,
        name,
        color,
      );

      // Get updated tag to return
      const updatedTag = await ServiceContainer.tag.getOneById.run(
        tagId as string,
        userId,
      );

      return res.status(200).json(TagMapper.toResponseDto(updatedTag));
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tags/{id}:
   *   delete:
   *     summary: Eliminar una etiqueta
   *     description: Elimina permanentemente una etiqueta del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la etiqueta a eliminar
   *     responses:
   *       204:
   *         description: Etiqueta eliminada exitosamente
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Etiqueta no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Tag not found"
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

      await ServiceContainer.tag.delete.run(req.params.id as string, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tasks/{taskId}/tags:
   *   get:
   *     summary: Obtener etiquetas de una tarea específica
   *     description: Retorna todas las etiquetas asociadas a una tarea específica del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea
   *     responses:
   *       200:
   *         description: Lista de etiquetas de la tarea obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Tag'
   *             example:
   *               - id: "123e4567-e89b-12d3-a456-426614174000"
   *                 name: "Urgente"
   *                 color: "#FF5733"
   *                 userId: "456e7890-e89b-12d3-a456-426614174001"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
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
  async getByTaskId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const taskId = req.params.taskId as string;

      const tags = await ServiceContainer.tag.getByTaskId.run(taskId, userId);

      return res.status(200).json(TagMapper.toResponseDtoList(tags));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /tags/{id}/tasks/{taskId}:
   *   post:
   *     summary: Asignar etiqueta a una tarea
   *     description: Asocia una etiqueta existente con una tarea específica del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la etiqueta
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea
   *     responses:
   *       204:
   *         description: Etiqueta asignada a la tarea exitosamente
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Etiqueta o tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Tag not found"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async assignToTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const tagId = req.params.id as string;
      const taskId = req.params.taskId as string;

      await ServiceContainer.tag.assignToTask.run(tagId, taskId, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /tags/{id}/tasks/{taskId}:
   *   delete:
   *     summary: Desasignar etiqueta de una tarea
   *     description: Desasocia una etiqueta de una tarea específica del usuario autenticado
   *     tags: [Tags]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la etiqueta
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la tarea
   *     responses:
   *       204:
   *         description: Etiqueta desasignada de la tarea exitosamente
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Etiqueta o tarea no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Tag not found"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ServerErrorResponse'
   */
  async unassignFromTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id as string;
      const tagId = req.params.id as string;
      const taskId = req.params.taskId as string;

      await ServiceContainer.tag.unassignFromTask.run(tagId, taskId, userId);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }
}
