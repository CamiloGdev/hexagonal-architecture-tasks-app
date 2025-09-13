import { AuthLogin } from '../../Auth/application/AuthLogin/AuthLogin';
import { AuthRegister } from '../../Auth/application/AuthRegister/AuthRegister';
import { BcryptPasswordHasher } from '../../Auth/infrastructure/BcryptPasswordHasher';
import { JsonWebTokenService } from '../../Auth/infrastructure/JsonWebTokenService';
import { CategoryCreate } from '../../Category/application/CategoryCreate/CategoryCreate';
import { CategoryDelete } from '../../Category/application/CategoryDelete/CategoryDelete';
import { CategoryGetAll } from '../../Category/application/CategoryGetAll/CategoryGetAll';
import { CategoryGetOneById } from '../../Category/application/CategoryGetOneById/CategoryGetOneById';
import { CategoryUpdate } from '../../Category/application/CategoryUpdate/CategoryUpdate';
import type { CategoryRepository } from '../../Category/domain/CategoryRepository';
import { PrismaCategoryRepository } from '../../Category/infrastructure/PrismaCategoryRepository';
import { TaskCreate } from '../../Task/application/TaskCreate/TaskCreate';
import { TaskDelete } from '../../Task/application/TaskDelete/TaskDelete';
import { TaskGetAll } from '../../Task/application/TaskGetAll/TaskGetAll';
import { TaskGetOneById } from '../../Task/application/TaskGetOneById/TaskGetOneById';
import { TaskToggleComplete } from '../../Task/application/TaskToggleComplete/TaskToggleComplete';
import { TaskUpdate } from '../../Task/application/TaskUpdate/TaskUpdate';
import type { TaskRepository } from '../../Task/domain/TaskRepository';
import { PrismaTaskRepository } from '../../Task/infrastructure/PrismaTaskRepository';
import { UserCreate } from '../../User/application/UserCreate/UserCreate';
import { UserDelete } from '../../User/application/UserDelete/UserDelete';
import { UserEdit } from '../../User/application/UserEdit/UserEdit';
import { UserGetAll } from '../../User/application/UserGetAll/UserGetAll';
import { UserGetOneById } from '../../User/application/UserGetOneById/UserGetOneById';
import type { UserRepository } from '../../User/domain/UserRepository';
import { PostgresUserRepository } from '../../User/infrastructure/PostgresUserRepository';
import { PrismaUserRepository } from '../../User/infrastructure/PrismaUserRepository';

// Factory function to create the appropriate repository based on environment
function createUserRepository(): UserRepository {
  const dbType = process.env.DB_TYPE || 'postgres';
  const databaseUrl = process.env.DATABASE_URL || '';

  switch (dbType.toLowerCase()) {
    case 'prisma': {
      return new PrismaUserRepository();
    }
    default: {
      return new PostgresUserRepository(databaseUrl);
    }
  }
}

// Factory function to create the task repository
function createTaskRepository(): TaskRepository {
  return new PrismaTaskRepository();
}

// Factory function to create the category repository
function createCategoryRepository(): CategoryRepository {
  return new PrismaCategoryRepository();
}

const userRepository = createUserRepository();
const taskRepository = createTaskRepository();
const categoryRepository = createCategoryRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JsonWebTokenService();

export const ServiceContainer = {
  user: {
    getAll: new UserGetAll(userRepository),
    getOneById: new UserGetOneById(userRepository),
    create: new UserCreate(userRepository),
    edit: new UserEdit(userRepository),
    delete: new UserDelete(userRepository),
  },
  auth: {
    register: new AuthRegister(userRepository, passwordHasher),
    login: new AuthLogin(userRepository, passwordHasher),
    tokenService: tokenService,
  },
  task: {
    create: new TaskCreate(taskRepository),
    getAll: new TaskGetAll(taskRepository),
    getOneById: new TaskGetOneById(taskRepository),
    update: new TaskUpdate(taskRepository),
    delete: new TaskDelete(taskRepository),
    toggleComplete: new TaskToggleComplete(taskRepository),
  },
  category: {
    create: new CategoryCreate(categoryRepository),
    getAll: new CategoryGetAll(categoryRepository),
    getOneById: new CategoryGetOneById(categoryRepository),
    update: new CategoryUpdate(categoryRepository),
    delete: new CategoryDelete(categoryRepository),
  },
};
