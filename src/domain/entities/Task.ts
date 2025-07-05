import { TaskId } from '../value-objects/TaskId';
import { TaskStatus, TaskStatusEnum } from '../value-objects/TaskStatus';
import { TaskTitle } from '../value-objects/TaskTitle';

export class Task {
  // cannot be called with new
  private constructor(
    private readonly _id: TaskId,
    private _title: TaskTitle,
    private _description: string,
    private _status: TaskStatusEnum,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {}

  // this is how we create a task
  static create(title: TaskTitle, description: string, id: TaskId): Task {
    if (!description) {
      throw new Error('Description is required');
    }

    const now = new Date();
    return new Task(id, title, description, TaskStatusEnum.PENDING, now, now);
  }

  // factory method for recreating a task from a database
  static fromPersistence(data: {
    id: string;
    title: string;
    description: string;
    status: TaskStatusEnum;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      TaskId.from(data.id),
      TaskTitle.create(data.title),
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
  get title(): TaskTitle {
    return this._title;
  }
  get description(): string {
    return this._description;
  }
  get status(): TaskStatusEnum {
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
    this._title = TaskTitle.create(title);
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this._description = description.trim();
    this._updatedAt = new Date();
  }

  markAsInProgress(): void {
    if (this._status !== TaskStatusEnum.PENDING) {
      throw new Error('Only pending tasks can be marked as in progress');
    }
    this._status = TaskStatusEnum.IN_PROGRESS;
    this._updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this._status === TaskStatusEnum.COMPLETED) {
      throw new Error('Task is already completed');
    }
    this._status = TaskStatusEnum.COMPLETED;
    this._updatedAt = new Date();
  }

  // For serialization (crossing boundaries)
  toJSON() {
    return {
      id: this._id.toString(),
      title: this._title.getValue(),
      description: this._description,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toPersistence() {
    return {
      id: this._id.toString(),
      title: this._title.getValue(),
      description: this._description,
      status: this._status,
    };
  }
}
