import type { UserCreatedAt } from './UserCreatedAt';
import type { UserEmail } from './UserEmail';
import type { UserId } from './UserId';
import type { UserName } from './UserName';
import type { UserPasswordHash } from './UserPasswordHash';
import type { UserUpdatedAt } from './UserUpdatedAt';

export class User {
  id?: UserId;
  name: UserName;
  email: UserEmail;
  password?: UserPasswordHash;
  createdAt?: UserCreatedAt;
  updatedAt?: UserUpdatedAt;

  private constructor(
    name: UserName,
    email: UserEmail,
    password?: UserPasswordHash,
    id?: UserId,
    createdAt?: UserCreatedAt,
    updatedAt?: UserUpdatedAt,
  ) {
    this.name = name;
    this.email = email;
    if (password) this.password = password;
    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  /**
   * Factory for creating a new user without password.
   * Used in the context of User management.
   */
  public static create(name: UserName, email: UserEmail): User {
    return new User(name, email);
  }

  /**
   * Factory for registering a new user with password.
   * Used in the Authentication context.
   */
  public static register(
    name: UserName,
    email: UserEmail,
    password: UserPasswordHash,
  ): User {
    return new User(name, email, password);
  }

  /**
   * Factory for reconstructing a user from persistence.
   * Used by repositories when hydrating domain objects.
   */
  public static fromPrimitives(
    name: UserName,
    email: UserEmail,
    id?: UserId,
    password?: UserPasswordHash,
    createdAt?: UserCreatedAt,
    updatedAt?: UserUpdatedAt,
  ): User {
    return new User(name, email, password, id, createdAt, updatedAt);
  }

  public nameAndEmail() {
    return `${this.name.value} - ${this.email.value}`;
  }
}
