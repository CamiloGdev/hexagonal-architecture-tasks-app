import { UserId } from '../../domain/UserId';
import { UserNotFoundError } from '../../domain/UserNotFoundError';
import type { UserRepository } from '../../domain/UserRepository';

export class UserDelete {
  constructor(private repository: UserRepository) {}

  async run(id: string): Promise<void> {
    const userId = new UserId(id);
    const existingUser = await this.repository.getOneById(userId);

    if (!existingUser) throw new UserNotFoundError();

    await this.repository.delete(userId);
  }
}
