import type { User } from '../../domain/User';
import { UserId } from '../../domain/UserId';
import { UserNotFoundError } from '../../domain/UserNotFoundError';
import type { UserRepository } from '../../domain/UserRepository';

export class UserGetOneById {
  constructor(private repository: UserRepository) {}

  async run(id: string): Promise<User> {
    const user = await this.repository.getOneById(new UserId(id));

    if (!user) throw new UserNotFoundError(); // retorna 404

    return user;
  }
}
