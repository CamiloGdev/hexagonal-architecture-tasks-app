export class TagId {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  public equals(other: TagId): boolean {
    return this.value === other.value;
  }
}
