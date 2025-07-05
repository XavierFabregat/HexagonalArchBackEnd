import { Task } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';
import { TaskRepository } from '@application/ports/TaskRepository';
import { v4 as uuidv4 } from 'uuid';

const uuid = uuidv4();

export class MockTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();
  private shouldFail: boolean = false;
  private failureMessage: string = 'Mock repository error';

  async save(task: Task): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    this.tasks.set(task.id.getValue(), task);
  }

  async findById(id: TaskId): Promise<Task | null> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    return this.tasks.get(id.getValue()) || null;
  }

  async findAll(): Promise<Task[]> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    return Array.from(this.tasks.values());
  }

  async delete(id: TaskId): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    this.tasks.delete(id.getValue());
  }

  async update(id: TaskId, task: Partial<Task>): Promise<Task | null> {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    const existingTask = this.tasks.get(id.getValue());

    if (!existingTask) {
      return null;
    }

    const existingTaskFromDB = {
      ...existingTask.toJSON(),
      id: uuid,
    };

    const updatedTask = Task.fromPersistence(existingTaskFromDB);
    if (task.title) {
      updatedTask.updateTitle(task.title);
    }
    if (task.description) {
      updatedTask.updateDescription(task.description);
    }
    if (task.status) {
      updatedTask.markAsInProgress();
    }
    this.tasks.set(id.getValue(), updatedTask);
    return updatedTask;
  }

  // Test helper methods
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  clear(): void {
    this.tasks.clear();
    this.shouldFail = false;
  }

  simulateFailure(message: string = 'Mock repository error'): void {
    this.shouldFail = true;
    this.failureMessage = message;
  }

  simulateSuccess(): void {
    this.shouldFail = false;
  }

  hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  getTaskCount(): number {
    return this.tasks.size;
  }
}
