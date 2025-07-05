export class TaskDescription {
  private constructor(private readonly _description: string) {}

  static create(description: string): TaskDescription {
    if (!description || description.trim() === '') {
      throw new Error('Description is required');
    }
    return new TaskDescription(description.trim());
  }

  getValue(): string {
    return this._description;
  }

  get description(): string {
    return this._description;
  }
}
