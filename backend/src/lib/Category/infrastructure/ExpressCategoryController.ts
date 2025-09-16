import type { NextFunction, Request, Response } from 'express';
import { ServiceContainer } from '../../Shared/infrastructure/ServiceContainer';
import { CategoryHasTasksError } from '../domain/CategoryHasTasksError';
import { CategoryNotFoundError } from '../domain/CategoryNotFoundError';
import { CategoryMapper } from './dtos/category.mapper';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías del usuario
 */
export class ExpressCategoryController {
  /**
   * @swagger
   * /categories:
   *   get:
   *     summary: Obtener todas las categorías del usuario
   *     description: Retorna una lista de todas las categorías del usuario autenticado
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Lista de categorías obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Category'
   *             example:
   *               - id: "123e4567-e89b-12d3-a456-426614174000"
   *                 name: "Trabajo"
   *                 color: "#3498DB"
   *                 userId: "456e7890-e89b-12d3-a456-426614174001"
   *                 createdAt: "2024-01-01T00:00:00.000Z"
   *                 updatedAt: "2024-01-01T00:00:00.000Z"
   *               - id: "789e0123-e89b-12d3-a456-426614174002"
   *                 name: "Personal"
   *                 color: "#E74C3C"
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

      const categories = await ServiceContainer.category.getAll.execute({
        userId,
      });

      return res.status(200).json(CategoryMapper.toResponseDtoList(categories));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   get:
   *     summary: Obtener una categoría específica por ID
   *     description: Retorna los detalles de una categoría específica del usuario autenticado
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la categoría
   *     responses:
   *       200:
   *         description: Categoría encontrada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Trabajo"
   *               color: "#3498DB"
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
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Category not found"
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

      const category = await ServiceContainer.category.getOneById.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(200).json(CategoryMapper.toResponseDto(category));
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /categories:
   *   post:
   *     summary: Crear una nueva categoría
   *     description: Crea una nueva categoría para el usuario autenticado
   *     tags: [Categories]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCategoryRequest'
   *     responses:
   *       201:
   *         description: Categoría creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Trabajo"
   *               color: "#3498DB"
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
   *                   message: "body.name Category name is required"
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

      const createdCategory = await ServiceContainer.category.create.execute({
        name,
        userId,
        color,
      });

      return res
        .status(201)
        .json(CategoryMapper.toResponseDto(createdCategory));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   patch:
   *     summary: Actualizar una categoría existente
   *     description: Actualiza parcialmente los campos de una categoría existente del usuario autenticado
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la categoría a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateCategoryRequest'
   *     responses:
   *       200:
   *         description: Categoría actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               name: "Trabajo Actualizado"
   *               color: "#2ECC71"
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
   *                   message: "params.id Category ID must be a valid UUID"
   *                 - field: "body.name"
   *                   message: "body.name Category name cannot exceed 50 characters"
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Category not found"
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
      const categoryId = req.params.id;

      const updatedCategory = await ServiceContainer.category.update.execute({
        id: categoryId as string,
        userId,
        name,
        color,
      });

      return res
        .status(200)
        .json(CategoryMapper.toResponseDto(updatedCategory));
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * @swagger
   * /categories/{id}:
   *   delete:
   *     summary: Eliminar una categoría
   *     description: Elimina permanentemente una categoría del usuario autenticado. No se puede eliminar una categoría que tenga tareas asignadas.
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID único de la categoría a eliminar
   *     responses:
   *       204:
   *         description: Categoría eliminada exitosamente
   *       400:
   *         description: No se puede eliminar la categoría porque tiene tareas asignadas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CategoryHasTasksErrorResponse'
   *             example:
   *               message: "Cannot delete category that has tasks assigned to it"
   *       401:
   *         description: No autorizado - Token JWT requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
   *       404:
   *         description: Categoría no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NotFoundErrorResponse'
   *             example:
   *               message: "Category not found"
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

      await ServiceContainer.category.delete.execute({
        id: req.params.id as string,
        userId,
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof CategoryHasTasksError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}
