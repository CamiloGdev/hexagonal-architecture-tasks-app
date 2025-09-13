import { User } from '../../../User/domain/User';
import { UserAlreadyExistsError } from '../../../User/domain/UserAlreadyExistsError';
import { UserEmail } from '../../../User/domain/UserEmail';
import { UserName } from '../../../User/domain/UserName';
import { UserPasswordHash } from '../../../User/domain/UserPasswordHash';
import type { UserRepository } from '../../../User/domain/UserRepository';
import type { PasswordHasher } from '../../domain/PasswordHasher';

export class AuthRegister {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async run(
    name: string,
    email: string,
    passwordPlainText: string,
  ): Promise<User> {
    // 1. Verificar si el usuario ya existe usando el método seguro y eficiente
    const userEmail = new UserEmail(email);
    const userExists = await this.repository.existsByEmail(userEmail);

    if (userExists) {
      throw new UserAlreadyExistsError(
        `User with email ${email} already exists`,
      );
    }

    // 2. Hashear la contraseña (la validación ya se realizó en el middleware)
    const hashedPassword = await this.passwordHasher.hash(passwordPlainText);

    // 3. Crear la entidad de dominio con el HASH usando el factory method
    const user = User.register(
      new UserName(name),
      userEmail,
      new UserPasswordHash(hashedPassword),
    );

    // 4. Persistir el usuario
    return await this.repository.create(user);
  }
}
