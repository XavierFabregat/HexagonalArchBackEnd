import { Task } from '@domain/entities/Task';
import { TaskRepository } from '@application/ports/TaskRepository';
import { TaskId } from '@domain/value-objects/TaskId';

export interface GetTaskCommand {
  id: string;
}

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: GetTaskCommand): Promise<Task | null> {
    const taskId = TaskId.from(command.id);
    return await this.taskRepository.findById(taskId);
  }
}
