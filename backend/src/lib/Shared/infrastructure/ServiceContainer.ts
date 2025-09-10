import { AuthLogin } from '../../Auth/application/AuthLogin/AuthLogin';
import { AuthRegister } from '../../Auth/application/AuthRegister/AuthRegister';
import { BcryptPasswordHasher } from '../../Auth/infrastructure/BcryptPasswordHasher';
import { UserCreate } from '../../User/application/UserCreate/UserCreate';
import { UserDelete } from '../../User/application/UserDelete/UserDelete';
import { UserEdit } from '../../User/application/UserEdit/UserEdit';
import { UserGetAll } from '../../User/application/UserGetAll/UserGetAll';
import { UserGetOneById } from '../../User/application/UserGetOneById/UserGetOneById';
import { PostgresUserRepository } from '../../User/infrastructure/PostgresUserRepository';

const userRepository = new PostgresUserRepository(
  process.env.DATABASE_URL || '',
);
const passwordHasher = new BcryptPasswordHasher();

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
  },
};
