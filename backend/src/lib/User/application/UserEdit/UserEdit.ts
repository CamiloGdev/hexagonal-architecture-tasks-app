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
    const updatedName =
      name !== undefined ? new UserName(name) : existingUser.name;
    const updatedEmail =
      email !== undefined ? new UserEmail(email) : existingUser.email;

    // Use fromPrimitives to reconstruct the user with updated fields
    const userToUpdate = User.fromPrimitives(
      updatedName,
      updatedEmail,
      new UserId(id),
      undefined, // Sin password
      existingUser.createdAt,
      existingUser.updatedAt,
    );

    return this.repository.edit(userToUpdate);
  }
}
