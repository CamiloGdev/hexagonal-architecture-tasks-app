export class TagNotFoundError extends Error {
  constructor() {
    super('Tag not found');
    this.name = 'TagNotFoundError';
  }
}
