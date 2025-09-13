import type { Category } from '../../domain/Category';
import type { CategoryResponseDto } from './category.response.dto';

export const CategoryMapper = {
  toResponseDto(category: Category): CategoryResponseDto {
    if (!category.id) {
      throw new Error('Cannot map Category without an ID');
    }
    
    if (!category.createdAt || !category.updatedAt) {
      throw new Error('Cannot map Category without createdAt or updatedAt timestamps');
    }
    
    return {
      id: category.id.value,
      name: category.name.value,
      color: category.color?.value || null,
      userId: category.userId.value,
      createdAt: category.createdAt.value,
      updatedAt: category.updatedAt.value,
    };
  },

  toResponseDtoList(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => CategoryMapper.toResponseDto(category));
  },
};
