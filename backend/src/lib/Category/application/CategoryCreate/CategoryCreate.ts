import { Category } from '../../domain/Category';
import { CategoryColor } from '../../domain/CategoryColor';
import { CategoryName } from '../../domain/CategoryName';
import type { CategoryRepository } from '../../domain/CategoryRepository';
import { CategoryUserId } from '../../domain/CategoryUserId';

export interface CategoryCreateRequest {
  name: string;
  userId: string;
  color?: string;
}

export class CategoryCreate {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CategoryCreateRequest): Promise<Category> {
    const category = Category.create(
      new CategoryName(request.name),
      new CategoryUserId(request.userId),
      request.color ? new CategoryColor(request.color) : undefined,
    );

    return await this.categoryRepository.create(category);
  }
}
