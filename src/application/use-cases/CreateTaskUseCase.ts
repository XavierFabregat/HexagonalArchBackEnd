import { Task } from '@domain/entities/Task';
import { TaskRepository } from '../ports/TaskRepository';

export interface CreateTaskCommand {
  title: string;
  description: string;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // 1. Use domain logic to create the task
    const task = Task.create(command.title, command.description);

    // 2. Save it through the repository port
    await this.taskRepository.save(task);

    // 3. Return the created task
    return task;
  }
}
