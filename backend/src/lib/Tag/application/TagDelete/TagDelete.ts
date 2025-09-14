import { TagId } from '../../domain/TagId';
import { TagNotFoundError } from '../../domain/TagNotFoundError';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagDelete {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(id: string, userId: string): Promise<void> {
    const tagId = new TagId(id);
    const tagUserId = new TagUserId(userId);

    const tag = await this.tagRepository.getOneById(tagId, tagUserId);

    if (!tag) {
      throw new TagNotFoundError();
    }

    await this.tagRepository.delete(tagId, tagUserId);
  }
}
