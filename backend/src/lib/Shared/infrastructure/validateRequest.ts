import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';

/**
 * Middleware genérico de validación con Zod para Express
 * Valida body, params y query de las peticiones HTTP
 */
export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Intenta parsear y validar el body, params y query
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Si la validación es exitosa, continuamos
      return next();
    } catch (error) {
      // Si la validación falla, devolvemos un error 400
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: `${issue.path.join('.')} ${issue.message}`,
        }));

        return res.status(400).json({
          error: 'Invalid request data',
          details: errorMessages,
        });
      }

      next(error);
    }
  };
