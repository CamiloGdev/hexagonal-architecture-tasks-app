import type { CategoryColor } from './CategoryColor';
import type { CategoryCreatedAt } from './CategoryCreatedAt';
import type { CategoryId } from './CategoryId';
import type { CategoryName } from './CategoryName';
import type { CategoryUpdatedAt } from './CategoryUpdatedAt';
import type { CategoryUserId } from './CategoryUserId';

export class Category {
  id?: CategoryId;
  name: CategoryName;
  color?: CategoryColor;
  userId: CategoryUserId;
  createdAt?: CategoryCreatedAt;
  updatedAt?: CategoryUpdatedAt;

  private constructor(
    name: CategoryName,
    userId: CategoryUserId,
    color?: CategoryColor,
    id?: CategoryId,
    createdAt?: CategoryCreatedAt,
    updatedAt?: CategoryUpdatedAt,
  ) {
    this.name = name;
    this.userId = userId;
    if (color) this.color = color;
    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  /**
   * Factory for creating a new category.
   * Used in the context of Category creation.
   */
  public static create(
    name: CategoryName,
    userId: CategoryUserId,
    color?: CategoryColor,
  ): Category {
    return new Category(name, userId, color);
  }

  /**
   * Factory for reconstructing a category from persistence.
   * Used by repositories when hydrating domain objects.
   */
  public static fromPrimitives(
    name: CategoryName,
    userId: CategoryUserId,
    id?: CategoryId,
    color?: CategoryColor,
    createdAt?: CategoryCreatedAt,
    updatedAt?: CategoryUpdatedAt,
  ): Category {
    return new Category(name, userId, color, id, createdAt, updatedAt);
  }

  public updateName(name: CategoryName): void {
    this.name = name;
  }

  public updateColor(color: CategoryColor): void {
    this.color = color;
  }
}
