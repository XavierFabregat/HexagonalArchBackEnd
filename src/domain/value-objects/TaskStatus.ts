export enum TaskStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export class TaskStatus {
  private constructor(private readonly _status: TaskStatusEnum) {}

  static create(status: string): TaskStatus {
    if (!status.length || status.trim() === '') {
      throw new Error('Status is required');
    }

    const statusEnum = TaskStatusEnum[status as keyof typeof TaskStatusEnum];
    status = status.trim();

    if (!Object.values(TaskStatusEnum).includes(status as TaskStatusEnum)) {
      throw new Error('Invalid status');
    }

    return new TaskStatus(status as TaskStatusEnum);
  }

  getValue(): TaskStatusEnum {
    return this._status;
  }

  get status(): TaskStatusEnum {
    return this._status;
  }
}
