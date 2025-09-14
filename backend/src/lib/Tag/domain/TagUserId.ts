export class TagUserId {
  readonly value: string;

  constructor(value: string) {
    this.ensureValidUserId(value);
    this.value = value;
  }

  private ensureValidUserId(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Tag user ID cannot be empty');
    }
  }

  public equals(other: TagUserId): boolean {
    return this.value === other.value;
  }
}
