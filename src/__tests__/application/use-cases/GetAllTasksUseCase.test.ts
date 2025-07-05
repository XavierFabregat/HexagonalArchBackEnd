import { GetAllTasksUseCase } from '@application/use-cases/GetAllTasksUseCase';
import { MockTaskRepository } from '../mocks/MockTaskRepository';
import { TaskId } from '@domain/value-objects/TaskId';
import { Task } from '@domain/entities/Task';
import { MockIdGenerator } from '../mocks/MockIdGenerator';
import { TaskTitle } from '@domain/value-objects/TaskTitle';

describe('GetAllTasksUseCase', () => {
  let useCase: GetAllTasksUseCase;
  let mockRepository: MockTaskRepository;
  let mockIdGenerator: MockIdGenerator;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    useCase = new GetAllTasksUseCase(mockRepository);
    mockIdGenerator = new MockIdGenerator();
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('Unsuccessful Task Retrieval', () => {
    it('should return an empty array if there are no tasks', async () => {
      const tasks = await useCase.execute();
      expect(tasks).toBeDefined();
      expect(tasks.length).toBe(0);
    });
  });

  describe('Successful Task Retrieval', () => {
    it('should return all tasks', async () => {
      mockRepository.save(
        Task.create(
          TaskTitle.create('Test Task'),
          'Test Description',
          TaskId.from(mockIdGenerator.generate())
        )
      );
      mockRepository.save(
        Task.create(
          TaskTitle.create('Test Task 2'),
          'Test Description 2',
          TaskId.from(mockIdGenerator.generate())
        )
      );
      const tasks = await useCase.execute();
      expect(tasks).toBeDefined();
      expect(tasks.length).toBe(mockRepository.getTasks().length);
    });
  });
});
