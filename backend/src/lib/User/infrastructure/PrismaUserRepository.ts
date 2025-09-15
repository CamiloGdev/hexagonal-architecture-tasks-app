import { PrismaClient } from '../../../generated/prisma';
import { User } from '../domain/User';
import { UserCreatedAt } from '../domain/UserCreatedAt';
import { UserEmail } from '../domain/UserEmail';
import { UserId } from '../domain/UserId';
import { UserName } from '../domain/UserName';
import { UserNotFoundError } from '../domain/UserNotFoundError';
import { UserPasswordHash } from '../domain/UserPasswordHash';
import type { UserRepository } from '../domain/UserRepository';
import { UserUpdatedAt } from '../domain/UserUpdatedAt';

type PrismaUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
};

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name.value,
        email: user.email.value,
        password_hash: user.password?.value || null,
      },
    });

    return this.mapToDomain(createdUser);
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user: PrismaUser) => this.mapToDomain(user));
  }

  async getOneById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id.value,
      },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomain(user);
  }

  async edit(user: User): Promise<User> {
    if (!user.id) {
      throw new UserNotFoundError();
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id.value,
        },
        data: {
          name: user.name.value,
          email: user.email.value,
        },
      });

      return this.mapToDomain(updatedUser);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new UserNotFoundError();
      }
      throw error;
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: {
          id: id.value,
        },
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new UserNotFoundError();
      }
      throw error;
    }
  }

  private mapToDomain(user: PrismaUser): User {
    return User.fromPrimitives(
      new UserName(user.name),
      new UserEmail(user.email),
      new UserId(user.id),
      undefined,
      new UserCreatedAt(user.created_at),
      new UserUpdatedAt(user.updated_at),
    );
  }

  // Método específico para autenticación que incluye el hash de la contraseña
  private mapToDomainWithPassword(user: PrismaUser): User | null {
    if (!user.password_hash) {
      return null;
    }

    return User.fromPrimitives(
      new UserName(user.name),
      new UserEmail(user.email),
      new UserId(user.id),
      new UserPasswordHash(user.password_hash),
      new UserCreatedAt(user.created_at),
      new UserUpdatedAt(user.updated_at),
    );
  }

  // Método específico para autenticación que incluye el hash de la contraseña
  async findAuthDataByEmail(email: UserEmail): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.value,
      },
    });

    if (!user || !user.password_hash) {
      return null;
    }

    return this.mapToDomainWithPassword(user);
  }

  // Método más seguro y eficiente para verificar si existe un usuario
  async existsByEmail(email: UserEmail): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.value,
      },
      select: {
        id: true,
      },
    });

    return user !== null;
  }

  // Método para cerrar la conexión de Prisma cuando sea necesario
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
