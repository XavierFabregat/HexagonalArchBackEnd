import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { Task, TaskStatus } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';
import { TaskRepository } from '@application/ports/TaskRepository';
import { tasks, TaskRow } from './schema';

export class DrizzleTaskRepository implements TaskRepository {
  private db: ReturnType<typeof drizzle>;

  constructor(private readonly connection: postgres.Sql) {
    this.db = drizzle(connection);
    console.log('🚀 Drizzle connection established');
  }

  async save(task: Task): Promise<void> {
    const taskRow = Task.create(task.title, task.description, task.id);
    await this.db
      .insert(tasks)
      .values(taskRow.toPersistence())
      .onConflictDoUpdate({
        target: [tasks.id],
        set: taskRow.toPersistence(),
      });
  }

  async findById(id: TaskId): Promise<Task | null> {
    try {
      const result = await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id.getValue()))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapRowToTask(result[0]);
    } catch (error) {
      console.error('Error finding task by ID:', error);
      throw new Error(`Failed to find task with id ${id}`);
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      const result = await this.db
        .select()
        .from(tasks)
        .orderBy(tasks.createdAt);

      return result.map((row) => this.mapRowToTask(row));
    } catch (error) {
      console.error('Error finding all tasks:', error);
      throw new Error('Failed to retrieve tasks');
    }
  }

  async delete(id: TaskId): Promise<void> {
    try {
      await this.db.delete(tasks).where(eq(tasks.id, id.getValue()));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(`Failed to delete task with id ${id}`);
    }
  }

  async update(id: TaskId, task: Partial<Task>): Promise<Task | null> {
    await this.db
      .update(tasks)
      .set({
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
      })
      .where(eq(tasks.id, id.getValue()));

    return this.findById(id);
  }

  private mapRowToTask(row: TaskRow): Task {
    return Task.fromPersistence({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  // Health check method
  async checkConnection(): Promise<boolean> {
    try {
      await this.db.select().from(tasks).limit(1);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
}
