import type { TagColor } from './TagColor';
import type { TagCreatedAt } from './TagCreatedAt';
import type { TagId } from './TagId';
import type { TagName } from './TagName';
import type { TagUpdatedAt } from './TagUpdatedAt';
import type { TagUserId } from './TagUserId';

export class Tag {
  id?: TagId;
  name: TagName;
  color?: TagColor;
  userId: TagUserId;
  createdAt?: TagCreatedAt;
  updatedAt?: TagUpdatedAt;

  private constructor(
    name: TagName,
    userId: TagUserId,
    color?: TagColor,
    id?: TagId,
    createdAt?: TagCreatedAt,
    updatedAt?: TagUpdatedAt,
  ) {
    this.name = name;
    this.userId = userId;
    if (color) this.color = color;
    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  /**
   * Factory for creating a new tag.
   * Used in the context of Tag creation.
   */
  public static create(
    name: TagName,
    userId: TagUserId,
    color?: TagColor,
  ): Tag {
    return new Tag(name, userId, color);
  }

  /**
   * Factory for reconstructing a tag from persistence.
   * Used by repositories when hydrating domain objects.
   */
  public static fromPrimitives(
    name: TagName,
    userId: TagUserId,
    id?: TagId,
    color?: TagColor,
    createdAt?: TagCreatedAt,
    updatedAt?: TagUpdatedAt,
  ): Tag {
    return new Tag(name, userId, color, id, createdAt, updatedAt);
  }

  public updateName(name: TagName): void {
    this.name = name;
  }

  public updateColor(color: TagColor): void {
    this.color = color;
  }
}
