export class CategoryNotFoundError extends Error {
  constructor(message: string = 'Category not found') {
    super(message);
    this.name = 'CategoryNotFoundError';
  }
}
