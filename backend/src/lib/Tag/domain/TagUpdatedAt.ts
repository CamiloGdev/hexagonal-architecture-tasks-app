export class TagUpdatedAt {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  public equals(other: TagUpdatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
