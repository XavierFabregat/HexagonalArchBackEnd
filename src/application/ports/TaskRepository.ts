import { Task } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
  update(id: TaskId, task: Partial<Task>): Promise<Task | null>;
}
