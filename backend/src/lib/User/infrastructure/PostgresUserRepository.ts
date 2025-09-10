import { Pool } from 'pg';
import { User } from '../domain/User';
import { UserCreatedAt } from '../domain/UserCreatedAt';
import { UserEmail } from '../domain/UserEmail';
import { UserId } from '../domain/UserId';
import { UserName } from '../domain/UserName';
import { UserNotFoundError } from '../domain/UserNotFoundError';
import { UserPasswordHash } from '../domain/UserPasswordHash';
import type { UserRepository } from '../domain/UserRepository';
import { UserUpdatedAt } from '../domain/UserUpdatedAt';

type PostgresUser = {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
};

export class PostgresUserRepository implements UserRepository {
  client: Pool;

  constructor(databaseUrl: string) {
    this.client = new Pool({
      connectionString: databaseUrl,
    });
  }

  async create(user: User): Promise<User> {
    const query = {
      text: 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      values: [user.name.value, user.email.value, user.password?.value],
    };

    const result = await this.client.query<PostgresUser>(query);
    const createdUserRow = result.rows[0];

    if (!createdUserRow) {
      throw new Error('Database failed to create user.');
    }

    return this.mapToDomain(createdUserRow);
  }

  async getAll(): Promise<User[]> {
    const query = {
      text: 'SELECT * FROM users',
    };

    const result = await this.client.query<PostgresUser>(query);

    return result.rows.map((row) => this.mapToDomain(row));
  }

  async getOneById(id: UserId): Promise<User | null> {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id.value],
    };

    const result = await this.client.query<PostgresUser>(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async edit(user: User): Promise<User> {
    const query = {
      text: 'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      values: [user.name.value, user.email.value, user.id?.value],
    };

    const result = await this.client.query<PostgresUser>(query);
    const updatedUserRow = result.rows[0];

    if (!updatedUserRow) {
      throw new UserNotFoundError();
    }

    return this.mapToDomain(updatedUserRow);
  }

  async delete(id: UserId): Promise<void> {
    const query = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [id.value],
    };

    await this.client.query(query);
  }

  private mapToDomain(user: PostgresUser): User {
    return new User(
      new UserName(user.name),
      new UserEmail(user.email),
      undefined,
      new UserId(user.id),
      new UserCreatedAt(user.created_at),
      new UserUpdatedAt(user.updated_at),
    );
  }

  // Método específico para autenticación que incluye el hash de la contraseña
  private mapToDomainWithPassword(user: PostgresUser): User | null {
    if (!user.password_hash) {
      return null;
    }

    return new User(
      new UserName(user.name),
      new UserEmail(user.email),
      new UserPasswordHash(user.password_hash),
      new UserId(user.id),
      new UserCreatedAt(user.created_at),
      new UserUpdatedAt(user.updated_at),
    );
  }

  // Método específico para autenticación que incluye el hash de la contraseña
  async findAuthDataByEmail(email: UserEmail): Promise<User | null> {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email.value],
    };

    const result = await this.client.query<PostgresUser>(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    if (!row || !row.password_hash) {
      return null;
    }

    return this.mapToDomainWithPassword(row);
  }

  // Método más seguro y eficiente para verificar si existe un usuario
  async existsByEmail(email: UserEmail): Promise<boolean> {
    const query = {
      text: 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      values: [email.value],
    };

    const result = await this.client.query<{ exists: boolean }>(query);
    return result.rows[0]?.exists ?? false;
  }
}
