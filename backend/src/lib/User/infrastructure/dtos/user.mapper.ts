import type { User } from '../../domain/User';
import type { UserResponseDto } from './user.response.dto';

// El Mapper es una utilidad de la capa de infraestructura.
// Su única responsabilidad es desacoplar el Dominio de la respuesta de la API.
export const UserMapper = {
  toResponseDto(user: User): UserResponseDto {
    // Creamos un objeto base con las propiedades obligatorias
    const dto: UserResponseDto = {
      name: user.name.value,
      email: user.email.value,
    };

    // Añadimos las propiedades opcionales solo si existen
    if (user.id?.value) {
      dto.id = user.id.value;
    }

    if (user.createdAt?.value) {
      dto.createdAt = user.createdAt.value;
    }

    if (user.updatedAt?.value) {
      dto.updatedAt = user.updatedAt.value;
    }

    return dto;
  },

  toResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map(UserMapper.toResponseDto);
  },
} as const;
