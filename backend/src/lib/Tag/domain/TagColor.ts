export class TagColor {
  readonly value: string;

  constructor(value: string) {
    this.ensureValidColor(value);
    this.value = value;
  }

  private ensureValidColor(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Tag color cannot be empty');
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(value)) {
      throw new Error(
        'Tag color must be a valid hex color (e.g., #FF5733 or #F53)',
      );
    }
  }

  public equals(other: TagColor): boolean {
    return this.value === other.value;
  }
}
