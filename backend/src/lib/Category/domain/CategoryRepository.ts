import type { Category } from './Category';
import type { CategoryId } from './CategoryId';
import type { CategoryUserId } from './CategoryUserId';

export interface CategoryRepository {
  create(category: Category): Promise<Category>;
  getAll(userId: CategoryUserId): Promise<Category[]>;
  getOneById(id: CategoryId, userId: CategoryUserId): Promise<Category | null>;
  update(category: Category): Promise<Category>;
  delete(id: CategoryId, userId: CategoryUserId): Promise<void>;
}
