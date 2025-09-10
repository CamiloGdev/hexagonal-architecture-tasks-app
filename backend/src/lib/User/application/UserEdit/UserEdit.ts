import { User } from '../../domain/User';
import { UserEmail } from '../../domain/UserEmail';
import { UserId } from '../../domain/UserId';
import { UserName } from '../../domain/UserName';
import { UserNotFoundError } from '../../domain/UserNotFoundError';
import type { UserRepository } from '../../domain/UserRepository';

export class UserEdit {
  constructor(private repository: UserRepository) {}

  async run(id: string, name?: string, email?: string): Promise<User> {
    // First, get the existing user to preserve createdAt and verify it exists
    const existingUser = await this.repository.getOneById(new UserId(id));

    if (!existingUser) throw new UserNotFoundError();

    // Create a new User object with the same ID but updated fields
    // If name or email is undefined, use the existing value
    const userToUpdate = new User(
      name !== undefined ? new UserName(name) : existingUser.name,
      email !== undefined ? new UserEmail(email) : existingUser.email,
      undefined, // Sin password
      new UserId(id),
    );

    return this.repository.edit(userToUpdate);
  }
}
