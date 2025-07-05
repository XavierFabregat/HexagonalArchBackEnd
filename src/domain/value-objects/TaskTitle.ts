export class TaskTitle {
  private constructor(private readonly _title: string) {}

  static create(title: string): TaskTitle {
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }
    return new TaskTitle(title.trim());
  }

  getValue(): string {
    return this._title;
  }

  get title(): string {
    return this._title;
  }
}
