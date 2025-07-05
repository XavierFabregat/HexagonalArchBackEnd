import { TaskId } from '../value-objects/TaskId';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export class Task {
  // cannot be called with new
  private constructor(
    private readonly _id: TaskId,
    private _title: string,
    private _description: string,
    private _status: TaskStatus,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  // this is how we create a task
  static create(title: string, description: string, id: TaskId): Task {
    if (!title || !description || !id) {
      throw new Error('Title, description and id are required');
    }

    const now = new Date();
    return new Task(id, title, description, TaskStatus.PENDING, now, now);
  }

  // factory method for recreating a task from a database
  static fromPersistence(data: {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      TaskId.from(data.id),
      data.title,
      data.description,
      data.status,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters (read only access)
  get id(): TaskId {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get description(): string {
    return this._description;
  }
  get status(): TaskStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business logic methods
  updateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new Error('Title cannot be empty');
    }
    this._title = title.trim();
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this._description = description.trim();
    this._updatedAt = new Date();
  }

  markAsInProgress(): void {
    if (this._status !== TaskStatus.PENDING) {
      throw new Error('Only pending tasks can be marked as in progress');
    }
    this._status = TaskStatus.IN_PROGRESS;
    this._updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this._status === TaskStatus.COMPLETED) {
      throw new Error('Task is already completed');
    }
    this._status = TaskStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  // For serialization (crossing boundaries)
  toJSON() {
    return {
      id: this._id.toString(),
      title: this._title,
      description: this._description,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
