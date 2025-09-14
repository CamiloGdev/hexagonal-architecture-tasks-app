import type { Tag } from './Tag';
import type { TagId } from './TagId';
import type { TagUserId } from './TagUserId';

export interface TagRepository {
  create(tag: Tag): Promise<Tag>;
  getAll(userId: TagUserId): Promise<Tag[]>;
  getOneById(id: TagId, userId: TagUserId): Promise<Tag | null>;
  update(tag: Tag): Promise<Tag>;
  delete(id: TagId, userId: TagUserId): Promise<void>;
  getTagsByTaskId(taskId: string, userId: TagUserId): Promise<Tag[]>;
  assignTagToTask(
    tagId: TagId,
    taskId: string,
    userId: TagUserId,
  ): Promise<void>;
  unassignTagFromTask(
    tagId: TagId,
    taskId: string,
    userId: TagUserId,
  ): Promise<void>;
}
