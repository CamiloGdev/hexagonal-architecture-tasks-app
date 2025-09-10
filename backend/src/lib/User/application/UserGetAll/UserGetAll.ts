import type { User } from '../../domain/User';
import type { UserRepository } from '../../domain/UserRepository';

export class UserGetAll {
  constructor(private repository: UserRepository) {}

  async run(): Promise<User[]> {
    return this.repository.getAll();
  }
}
