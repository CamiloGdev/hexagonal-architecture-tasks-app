import { Tag } from '../../domain/Tag';
import { TagColor } from '../../domain/TagColor';
import { TagName } from '../../domain/TagName';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagCreate {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(name: string, userId: string, color?: string): Promise<Tag> {
    const tagName = new TagName(name);
    const tagUserId = new TagUserId(userId);
    const tagColor = color ? new TagColor(color) : undefined;

    const tag = Tag.create(tagName, tagUserId, tagColor);

    return await this.tagRepository.create(tag);
  }
}
