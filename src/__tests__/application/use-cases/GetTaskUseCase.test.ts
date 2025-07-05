import { GetTaskUseCase } from '@application/use-cases/GetTaskUseCase';
import { MockTaskRepository } from '../mocks/MockTaskRepository';
import { MockIdGenerator } from '../mocks/MockIdGenerator';
import { Task } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';
import { TaskTitle } from '@domain/value-objects/TaskTitle';
import { TaskDescription } from '@domain/value-objects/TaskDescription';

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;
  let mockRepository: MockTaskRepository;
  let mockIdGenerator: MockIdGenerator;
  let taskId: TaskId;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    useCase = new GetTaskUseCase(mockRepository);
    mockIdGenerator = new MockIdGenerator();
    taskId = TaskId.from(mockIdGenerator.generate());
    mockRepository.save(
      Task.create(
        TaskTitle.create('Test Task'),
        TaskDescription.create('Test Description'),
        taskId
      )
    );
  });

  describe('Successful Task Retrieval', () => {
    it('should return a task if it exists', async () => {
      const command = {
        id: taskId.getValue(),
      };
      const task = await useCase.execute(command);
      expect(task).toBeDefined();
      expect(task?.id.getValue()).toBe(taskId.getValue());
      expect(task?.title.getValue()).toBe('Test Task');
    });
  });

  describe('Unsuccessful Task Retrieval', () => {
    it('should return null if the task does not exist', async () => {
      const command = {
        id: mockIdGenerator.generate(),
      };
      const task = await useCase.execute(command);
      expect(task).toBeNull();
    });
  });
});
