export class TaskId {
  private constructor(private readonly value: string) {}

  static from(value: string): TaskId {
    if (!value || value.trim() === '') {
      throw new Error('TaskId cannot be empty');
    }

    if (value.length !== 36) {
      throw new Error('TaskId must be a valid UUID');
    }

    const idRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!idRegex.test(value)) {
      throw new Error('TaskId must be a valid UUID');
    }

    // other checks we want to do
    return new TaskId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
