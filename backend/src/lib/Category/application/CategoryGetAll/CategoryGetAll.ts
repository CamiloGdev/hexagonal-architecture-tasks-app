import type { Category } from '../../domain/Category';
import type { CategoryRepository } from '../../domain/CategoryRepository';
import { CategoryUserId } from '../../domain/CategoryUserId';

export interface CategoryGetAllRequest {
  userId: string;
}

export class CategoryGetAll {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CategoryGetAllRequest): Promise<Category[]> {
    return await this.categoryRepository.getAll(
      new CategoryUserId(request.userId),
    );
  }
}
