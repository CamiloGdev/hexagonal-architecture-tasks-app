import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { setupSwagger } from './config/swagger.config';
import { ExpressAuthController } from './lib/Auth/infrastructure/ExpressAuthController';
import { registerExpressAuthRoutes } from './lib/Auth/infrastructure/ExpressAuthRoutes';
import { ExpressCategoryController } from './lib/Category/infrastructure/ExpressCategoryController';
import { registerExpressCategoryRoutes } from './lib/Category/infrastructure/ExpressCategoryRoutes';
import { ExpressTagController } from './lib/Tag/infrastructure/ExpressTagController';
import { registerExpressTagRoutes } from './lib/Tag/infrastructure/ExpressTagRoutes';
import { ExpressTaskController } from './lib/Task/infrastructure/ExpressTaskController';
import { registerExpressTaskRoutes } from './lib/Task/infrastructure/ExpressTaskRoutes';
import { ExpressUserController } from './lib/User/infrastructure/ExpressUserController';
import { registerExpressUserRoutes } from './lib/User/infrastructure/ExpressUserRouter';

// Cargar variables de entorno
process.loadEnvFile();

// Puerto de la aplicación
const PORT = process.env.PORT || 3001;

// Crear la aplicación Express
const app: Express = express();
const router = Router();

// Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

// Configurar CORS
// Lista de orígenes permitidos
// Lista INICIAL solo para desarrollo
const allowedOrigins: string[] = [];

// AÑADIMOS orígenes según el entorno
if (process.env.NODE_ENV === 'production') {
  const frontendUrl = process.env.FRONTEND_URL; // ej: 'https://mi-app-task.com'
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }
} else {
  // Solo en desarrollo, permitimos localhost
  allowedOrigins.push('http://localhost:3001'); // Frontend en puerto 3001 (swagger)
  allowedOrigins.push('http://localhost:3000'); // Frontend en puerto 3000 (react)
  // Agrega aquí otros puertos que uses para desarrollo
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permite peticiones sin 'origin' (como apps móviles, Postman, o curl)
    // o si el origen está en nuestra lista de allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Configurar los módulos
// Inicializar controladores
const authController = new ExpressAuthController();
const userController = new ExpressUserController();
const taskController = new ExpressTaskController();
const categoryController = new ExpressCategoryController();
const tagController = new ExpressTagController();

// Registrar rutas de autenticación
registerExpressAuthRoutes(router, authController);

// Registrar rutas de usuario
registerExpressUserRoutes(router, userController);

// Registrar rutas de tareas
registerExpressTaskRoutes(router, taskController);

// Registrar rutas de categorías
registerExpressCategoryRoutes(router, categoryController);

// Registrar rutas de etiquetas
registerExpressTagRoutes(router, tagController);

// Registrar el router principal
app.use('/api', router);

// Configurar Swagger UI para documentación de la API solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
  console.log(`Swagger UI disponible en: http://localhost:${PORT}/api-docs`);
}

// Ruta de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// Middleware para manejar rutas no encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Middleware para manejo de errores
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    console.error(err.stack);
    return res.status(500).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
