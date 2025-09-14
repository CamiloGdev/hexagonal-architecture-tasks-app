import type { Tag } from '../../domain/Tag';
import type { TagResponseDto } from './tag.response.dto';

export const TagMapper = {
  toResponseDto(tag: Tag): TagResponseDto {
    if (!tag.id) {
      throw new Error('Cannot map Tag without an ID');
    }

    if (!tag.createdAt || !tag.updatedAt) {
      throw new Error(
        'Cannot map Tag without createdAt or updatedAt timestamps',
      );
    }

    return {
      id: tag.id.value,
      name: tag.name.value,
      color: tag.color?.value || null,
      userId: tag.userId.value,
      createdAt: tag.createdAt.value,
      updatedAt: tag.updatedAt.value,
    };
  },

  toResponseDtoList(tags: Tag[]): TagResponseDto[] {
    return tags.map((tag) => TagMapper.toResponseDto(tag));
  },
};
