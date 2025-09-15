import { CategoryHasTasksError } from '../../domain/CategoryHasTasksError';
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
    const categoryId = new CategoryId(request.id);
    const userId = new CategoryUserId(request.userId);

    const existingCategory = await this.categoryRepository.getOneById(
      categoryId,
      userId,
    );

    if (!existingCategory) {
      throw new CategoryNotFoundError();
    }

    // Check if category has tasks assigned
    const hasTasks = await this.categoryRepository.hasTasks(categoryId, userId);
    if (hasTasks) {
      throw new CategoryHasTasksError();
    }

    await this.categoryRepository.delete(categoryId, userId);
  }
}
