import { User } from '../../domain/User';
import { UserAlreadyExistsError } from '../../domain/UserAlreadyExistsError';
import { UserEmail } from '../../domain/UserEmail';
import { UserName } from '../../domain/UserName';
import type { UserRepository } from '../../domain/UserRepository';

export class UserCreate {
  constructor(private repository: UserRepository) {}

  async run(name: string, email: string): Promise<User> {
    const userEmail = new UserEmail(email);

    // Verificar si ya existe un usuario con este email usando el método seguro y eficiente
    const userExists = await this.repository.existsByEmail(userEmail);
    if (userExists) {
      throw new UserAlreadyExistsError(
        `User with email ${email} already exists`,
      );
    }

    // Usamos el método factory create
    const newUser = User.create(new UserName(name), userEmail);

    return this.repository.create(newUser);
  }
}
