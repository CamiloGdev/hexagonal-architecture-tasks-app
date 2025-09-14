import type { Tag } from '../../domain/Tag';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagGetAll {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(userId: string): Promise<Tag[]> {
    const tagUserId = new TagUserId(userId);
    return await this.tagRepository.getAll(tagUserId);
  }
}
