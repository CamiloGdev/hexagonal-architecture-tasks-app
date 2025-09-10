import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { ExpressUserController } from './lib/User/infrastructure/ExpressUserController';
import { registerExpressUserRoutes } from './lib/User/infrastructure/ExpressUserRouter';

// Cargar variables de entorno
process.loadEnvFile();

// Crear la aplicación Express
const app: Express = express();
const router = Router();

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Configurar los módulos
// Inicializar controladores
const userController = new ExpressUserController();

// Registrar rutas de usuario
registerExpressUserRoutes(router, userController);

// Registrar el router principal
app.use('/api', router);

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

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
