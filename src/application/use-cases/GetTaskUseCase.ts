import { Task } from '@domain/entities/Task';
import { TaskRepository } from '@application/ports/TaskRepository';
import { TaskId } from '../../domain/value-objects/TaskId';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    const taskId = TaskId.from(id);
    return await this.taskRepository.findById(taskId);
  }
}
