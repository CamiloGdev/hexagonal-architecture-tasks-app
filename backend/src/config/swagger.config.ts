import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

process.loadEnvFile();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tasks Fracttal API',
      version: '1.0.0',
      description:
        'API para la gestión de tareas con sistema de autenticación JWT',
      contact: {
        name: 'API Support',
        email: 'support@tasksfracttal.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description:
            'Token JWT almacenado en cookie HttpOnly para autenticación. Se establece automáticamente al hacer login o register.',
        },
      },
      schemas: {
        Category: {
          type: 'object',
          required: ['id', 'name', 'userId', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador único de la categoría',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la categoría',
              example: 'Trabajo',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              nullable: true,
              description: 'Color de la categoría en formato hexadecimal',
              example: '#3498DB',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario propietario de la categoría',
              example: '456e7890-e89b-12d3-a456-426614174001',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la categoría',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización de la categoría',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Tag: {
          type: 'object',
          required: ['id', 'name', 'userId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador único de la etiqueta',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la etiqueta',
              example: 'Urgente',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              nullable: true,
              description: 'Color de la etiqueta en formato hexadecimal',
              example: '#FF5733',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario propietario de la etiqueta',
              example: '456e7890-e89b-12d3-a456-426614174001',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la etiqueta',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización de la etiqueta',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Task: {
          type: 'object',
          required: [
            'id',
            'title',
            'completed',
            'priority',
            'userId',
            'categoryId',
            'createdAt',
            'updatedAt',
          ],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador único de la tarea',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Título de la tarea',
              example: 'Completar documentación de la API',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              nullable: true,
              description: 'Descripción detallada de la tarea',
              example:
                'Crear documentación completa usando Swagger para todos los endpoints del módulo de tareas',
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completitud de la tarea',
              example: false,
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              description: 'Prioridad de la tarea',
              example: 'HIGH',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha límite para completar la tarea',
              example: '2024-12-31T23:59:59.000Z',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha y hora cuando se completó la tarea',
              example: '2024-01-15T10:30:00.000Z',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario propietario de la tarea',
              example: '456e7890-e89b-12d3-a456-426614174001',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description:
                'ID de la categoría asociada a la tarea (obligatorio)',
              example: '789e0123-e89b-12d3-a456-426614174002',
            },
            tags: {
              type: 'array',
              description: 'Lista de etiquetas asociadas a la tarea',
              items: {
                $ref: '#/components/schemas/Tag',
              },
              example: [
                {
                  id: '123e4567-e89b-12d3-a456-426614174003',
                  name: 'Urgente',
                  color: '#FF5733',
                  userId: '456e7890-e89b-12d3-a456-426614174001',
                },
              ],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la tarea',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización de la tarea',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title', 'categoryId'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Título de la tarea',
              example: 'Nueva tarea importante',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción detallada de la tarea',
              example: 'Esta es una descripción detallada de la nueva tarea',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              description: 'Prioridad de la tarea (por defecto: MEDIUM)',
              example: 'HIGH',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha límite para completar la tarea',
              example: '2024-12-31T23:59:59.000Z',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la categoría asociada (obligatorio)',
              example: '789e0123-e89b-12d3-a456-426614174002',
            },
            tagIds: {
              type: 'array',
              description: 'Lista de IDs de etiquetas a asociar con la tarea',
              items: {
                type: 'string',
                format: 'uuid',
              },
              example: ['123e4567-e89b-12d3-a456-426614174003'],
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              description: 'Título de la tarea',
              example: 'Tarea actualizada',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Descripción detallada de la tarea',
              example: 'Descripción actualizada de la tarea',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              description: 'Prioridad de la tarea',
              example: 'LOW',
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completitud de la tarea',
              example: true,
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha límite para completar la tarea',
              example: '2024-12-31T23:59:59.000Z',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la categoría asociada',
              example: '789e0123-e89b-12d3-a456-426614174002',
            },
            tagIds: {
              type: 'array',
              description: 'Lista de IDs de etiquetas a asociar con la tarea',
              items: {
                type: 'string',
                format: 'uuid',
              },
              example: ['123e4567-e89b-12d3-a456-426614174003'],
            },
          },
        },
        ToggleCompleteRequest: {
          type: 'object',
          required: ['completed'],
          properties: {
            completed: {
              type: 'boolean',
              description: 'Nuevo estado de completitud de la tarea',
              example: true,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Task not found',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo de error de validación',
              example: 'Invalid request data',
            },
            details: {
              type: 'array',
              description: 'Detalles específicos de los errores de validación',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Campo que contiene el error',
                    example: 'body.title',
                  },
                  message: {
                    type: 'string',
                    description: 'Mensaje descriptivo del error',
                    example: 'body.title Title is required',
                  },
                },
              },
              example: [
                {
                  field: 'body.title',
                  message: 'body.title Title is required',
                },
                {
                  field: 'body.priority',
                  message:
                    'body.priority Invalid enum value. Expected LOW | MEDIUM | HIGH',
                },
              ],
            },
          },
        },
        UnauthorizedErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error de autenticación',
              example: 'Authentication required: No token provided.',
            },
          },
        },
        ForbiddenErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error de autorización',
              example: 'Forbidden: Invalid or expired token.',
            },
          },
        },
        NotFoundErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error cuando el recurso no se encuentra',
              example: 'Task not found',
            },
          },
        },
        ServerErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error interno del servidor',
              example: 'Internal server error',
            },
          },
        },
        ConflictErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error de conflicto (recurso ya existe)',
              example: 'User already exists',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identificador único del usuario',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'juan.perez@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del usuario',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único del usuario',
              example: 'juan.perez@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              description:
                'Contraseña segura (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos especiales)',
              example: 'MiPassword123!',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'juan.perez@example.com',
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
              example: 'MiPassword123!',
            },
          },
        },
        AuthSuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito',
              example: 'User registered successfully',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        RefreshSuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito del refresh',
              example: 'Access token refreshed',
            },
          },
        },
        LogoutSuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito del logout',
              example: 'Logout successful',
            },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la categoría',
              example: 'Trabajo',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              description: 'Color de la categoría en formato hexadecimal',
              example: '#3498DB',
            },
          },
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la categoría',
              example: 'Trabajo Actualizado',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              description: 'Color de la categoría en formato hexadecimal',
              example: '#2ECC71',
            },
          },
        },
        CreateTagRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la etiqueta',
              example: 'Urgente',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              description: 'Color de la etiqueta en formato hexadecimal',
              example: '#FF5733',
            },
          },
        },
        UpdateTagRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              description: 'Nombre de la etiqueta',
              example: 'Muy Urgente',
            },
            color: {
              type: 'string',
              pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
              description: 'Color de la etiqueta en formato hexadecimal',
              example: '#E74C3C',
            },
          },
        },
        CategoryHasTasksErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description:
                'Mensaje de error cuando se intenta eliminar una categoría que tiene tareas asignadas',
              example: 'Cannot delete category that has tasks assigned to it',
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './src/lib/Auth/infrastructure/ExpressAuthController.ts',
    './src/lib/Auth/infrastructure/ExpressAuthRoutes.ts',
    './src/lib/Task/infrastructure/ExpressTaskController.ts',
    './src/lib/Task/infrastructure/ExpressTaskRoutes.ts',
    './src/lib/Tag/infrastructure/ExpressTagController.ts',
    './src/lib/Tag/infrastructure/ExpressTagRoutes.ts',
    './src/lib/Category/infrastructure/ExpressCategoryController.ts',
    './src/lib/Category/infrastructure/ExpressCategoryRoutes.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Tasks Fracttal API Documentation',
    }),
  );
};

export { specs };
