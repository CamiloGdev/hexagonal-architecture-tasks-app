export class TagCreatedAt {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  public equals(other: TagCreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
