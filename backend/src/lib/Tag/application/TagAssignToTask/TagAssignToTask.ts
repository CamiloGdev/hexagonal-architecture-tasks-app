import { TagId } from '../../domain/TagId';
import { TagNotFoundError } from '../../domain/TagNotFoundError';
import type { TagRepository } from '../../domain/TagRepository';
import { TagUserId } from '../../domain/TagUserId';

export class TagAssignToTask {
  constructor(private readonly tagRepository: TagRepository) {}

  async run(tagId: string, taskId: string, userId: string): Promise<void> {
    const tagIdVO = new TagId(tagId);
    const tagUserId = new TagUserId(userId);

    // Verify tag exists and belongs to user
    const tag = await this.tagRepository.getOneById(tagIdVO, tagUserId);
    if (!tag) {
      throw new TagNotFoundError();
    }

    await this.tagRepository.assignTagToTask(tagIdVO, taskId, tagUserId);
  }
}
