import { TaskRepository } from '@application/ports/TaskRepository';
import { Task } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';

export class InMemoryRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id.getValue(), task);
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async delete(id: TaskId): Promise<void> {
    this.tasks.delete(id.getValue());
    return Promise.resolve();
  }

  async findById(id: TaskId): Promise<Task | null> {
    return this.tasks.get(id.getValue()) || null;
  }

  async update(id: TaskId, task: Partial<Task>): Promise<Task | null> {
    const existingTask = this.tasks.get(id.getValue());
    if (!existingTask) {
      return null;
    }
    Object.assign(existingTask, task);
    return existingTask;
  }

  size(): number {
    return this.tasks.size;
  }

  clear(): void {
    this.tasks.clear();
  }
}
