import type { Category } from '../../domain/Category';
import { CategoryColor } from '../../domain/CategoryColor';
import { CategoryId } from '../../domain/CategoryId';
import { CategoryName } from '../../domain/CategoryName';
import { CategoryNotFoundError } from '../../domain/CategoryNotFoundError';
import type { CategoryRepository } from '../../domain/CategoryRepository';
import { CategoryUserId } from '../../domain/CategoryUserId';

export interface CategoryUpdateRequest {
  id: string;
  userId: string;
  name?: string;
  color?: string;
}

export class CategoryUpdate {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CategoryUpdateRequest): Promise<Category> {
    const existingCategory = await this.categoryRepository.getOneById(
      new CategoryId(request.id),
      new CategoryUserId(request.userId),
    );

    if (!existingCategory) {
      throw new CategoryNotFoundError();
    }

    // Update fields if provided
    if (request.name !== undefined) {
      existingCategory.updateName(new CategoryName(request.name));
    }

    if (request.color !== undefined) {
      existingCategory.updateColor(new CategoryColor(request.color));
    }

    return await this.categoryRepository.update(existingCategory);
  }
}
