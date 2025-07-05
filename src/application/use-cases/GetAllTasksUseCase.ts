import { Task } from '@domain/entities/Task';
import { TaskRepository } from '@application/ports/TaskRepository';

export class GetAllTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }
}
