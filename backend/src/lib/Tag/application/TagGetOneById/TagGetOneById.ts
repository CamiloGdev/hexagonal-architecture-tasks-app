import type { Tag } from '../../domain/Tag';
import { TagId } from '../../domain/TagId';
import { TagNotFoundError } from '../../domain/TagNotFoundError';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagGetOneById {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(id: string, userId: string): Promise<Tag> {
    const tagId = new TagId(id);
    const tagUserId = new TagUserId(userId);

    const tag = await this.tagRepository.getOneById(tagId, tagUserId);

    if (!tag) {
      throw new TagNotFoundError();
    }

    return tag;
  }
}
