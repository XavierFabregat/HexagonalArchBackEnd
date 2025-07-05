import { Task } from '@domain/entities/Task';
import { TaskRepository } from '../ports/TaskRepository';
import { TaskId } from '@domain/value-objects/TaskId';
import { IdGenerator } from '../ports/IdGenerator';
import { TaskTitle } from '@domain/value-objects/TaskTitle';
import { TaskDescription } from '@domain/value-objects/TaskDescription';

export interface CreateTaskCommand {
  title: string;
  description: string;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // 1. Use domain logic to create the task
    const task = Task.create(
      TaskTitle.create(command.title),
      TaskDescription.create(command.description),
      TaskId.from(this.idGenerator.generate())
    );

    // 2. Save it through the repository port
    await this.taskRepository.save(task);

    // 3. Return the created task
    return task;
  }
}
