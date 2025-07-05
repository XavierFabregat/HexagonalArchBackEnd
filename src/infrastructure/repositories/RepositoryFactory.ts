import { TaskRepository } from '@application/ports/TaskRepository';
import { InMemoryRepository } from './memory/InMemoryRepository';
import { DrizzleTaskRepository } from './drizzle/drizzleTaskRepository';
import postgres from 'postgres';
import { SequelizeTaskRepository } from './sequelize/sequelizeTaskRepository';

export type RepositoryType = 'memory' | 'postgres' | 'sequelize';

export class RepositoryFactory {
  static createTaskRepository(type: RepositoryType): TaskRepository {
    switch (type) {
      case 'memory':
        return new InMemoryRepository();

      case 'postgres':
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error(
            'DATABASE_URL environment variable is required for PostgreSQL'
          );
        }
        const connection = postgres(connectionString);
        return new DrizzleTaskRepository(connection);

      case 'sequelize':
        return new SequelizeTaskRepository();

      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
