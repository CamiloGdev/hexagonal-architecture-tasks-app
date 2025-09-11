import type { TokenPayload } from '../../../Auth/domain/TokenService';

// Extiende el namespace de Express para añadir la propiedad 'user' al objeto Request
declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
    }
  }
}
