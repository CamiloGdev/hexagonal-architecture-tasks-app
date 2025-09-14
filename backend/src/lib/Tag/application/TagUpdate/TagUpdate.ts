import { TagColor } from '../../domain/TagColor';
import { TagId } from '../../domain/TagId';
import { TagName } from '../../domain/TagName';
import { TagNotFoundError } from '../../domain/TagNotFoundError';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagUpdate {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(
    id: string,
    userId: string,
    name?: string,
    color?: string,
  ): Promise<void> {
    const tagId = new TagId(id);
    const tagUserId = new TagUserId(userId);

    const tag = await this.tagRepository.getOneById(tagId, tagUserId);

    if (!tag) {
      throw new TagNotFoundError();
    }

    if (name) {
      tag.updateName(new TagName(name));
    }

    if (color) {
      tag.updateColor(new TagColor(color));
    }

    await this.tagRepository.update(tag);
  }
}
