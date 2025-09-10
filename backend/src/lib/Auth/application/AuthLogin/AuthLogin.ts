import type { User } from '../../../User/domain/User';
import { UserEmail } from '../../../User/domain/UserEmail';
import { UserNotFoundError } from '../../../User/domain/UserNotFoundError';
import type { UserRepository } from '../../../User/domain/UserRepository';
import type { PasswordHasher } from '../../domain/PasswordHasher';

export class AuthLogin {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async run(email: string, passwordPlainText: string): Promise<User> {
    // 1. Buscar al usuario por email usando el método específico para autenticación
    const userEmail = new UserEmail(email);
    const user = await this.userRepository.findAuthDataByEmail(userEmail);

    // 2. Si no existe el usuario, la autenticación falla
    if (!user) {
      throw new UserNotFoundError('Invalid credentials');
    }

    // 3. Comparar la contraseña en texto plano con el hash almacenado
    const isPasswordValid = await this.passwordHasher.compare(
      passwordPlainText,
      user.password?.value || '',
    );

    // 4. Si la contraseña no es válida, la autenticación falla
    if (!isPasswordValid) {
      throw new UserNotFoundError('Invalid credentials');
    }

    return user;
  }
}
