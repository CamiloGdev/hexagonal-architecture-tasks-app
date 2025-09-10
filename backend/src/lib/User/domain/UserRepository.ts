import type { User } from './User';
import type { UserEmail } from './UserEmail';
import type { UserId } from './UserId';

export interface UserRepository {
  create(user: User): Promise<User>;
  getAll(): Promise<User[]>;
  getOneById(id: UserId): Promise<User | null>;
  findAuthDataByEmail(email: UserEmail): Promise<User | null>;
  existsByEmail(email: UserEmail): Promise<boolean>;
  edit(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
}
