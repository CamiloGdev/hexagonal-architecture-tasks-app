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

  constructor(
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

  public static create(
    name: UserName,
    email: UserEmail,
    password: UserPasswordHash,
  ): User {
    return new User(name, email, password);
  }


  public nameAndEmail() {
    return `${this.name.value} - ${this.email.value}`;
  }
}
