import { CategoryId } from '../../domain/CategoryId';
import { CategoryNotFoundError } from '../../domain/CategoryNotFoundError';
import type { CategoryRepository } from '../../domain/CategoryRepository';
import { CategoryUserId } from '../../domain/CategoryUserId';

export interface CategoryDeleteRequest {
  id: string;
  userId: string;
}

export class CategoryDelete {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: CategoryDeleteRequest): Promise<void> {
    const existingCategory = await this.categoryRepository.getOneById(
      new CategoryId(request.id),
      new CategoryUserId(request.userId),
    );

    if (!existingCategory) {
      throw new CategoryNotFoundError();
    }

    await this.categoryRepository.delete(
      new CategoryId(request.id),
      new CategoryUserId(request.userId),
    );
  }
}
