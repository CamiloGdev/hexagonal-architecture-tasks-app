export class CategoryHasTasksError extends Error {
  constructor() {
    super('Cannot delete category that has tasks assigned to it');
    this.name = 'CategoryHasTasksError';
  }
}
