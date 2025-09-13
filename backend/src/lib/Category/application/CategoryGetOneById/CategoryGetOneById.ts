import type { Category } from '../../domain/Category';
import { CategoryId } from '../../domain/CategoryId';
import { CategoryNotFoundError } from '../../domain/CategoryNotFoundError';
import type { CategoryRepository } from '../../domain/CategoryRepository';
import { CategoryUserId } from '../../domain/CategoryUserId';

export interface CategoryGetOneByIdRequest {
  id: string;
  userId: string;
}

export class CategoryGetOneById {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CategoryGetOneByIdRequest): Promise<Category> {
    const category = await this.categoryRepository.getOneById(
      new CategoryId(request.id),
      new CategoryUserId(request.userId),
    );

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return category;
  }
}
