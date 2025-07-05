import { CreateTaskUseCase } from '@application/use-cases/CreateTaskUseCase';
import { TaskStatusEnum } from '@domain/value-objects/TaskStatus';
import { MockTaskRepository } from '../mocks/MockTaskRepository';
import { v4 as uuidv4 } from 'uuid';
import { MockIdGenerator } from '../mocks/MockIdGenerator';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    useCase = new CreateTaskUseCase(mockRepository, new MockIdGenerator());
  });

  describe('Successful Task Creation', () => {
    it('should create a task with valid command', async () => {
      const command = {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
      };

      const result = await useCase.execute(command);

      expect(result.title.getValue()).toBe('Buy groceries');
      expect(result.description).toBe('Milk, eggs, bread');
      expect(result.status).toBe(TaskStatusEnum.PENDING);
    });

    it('should persist the task through the repository', async () => {
      const command = {
        title: 'Test Task',
        description: 'Test Description',
      };

      await useCase.execute(command);

      expect(mockRepository.getTaskCount()).toBe(1);
      expect(mockRepository.getTasks()[0].id.getValue()).toBeDefined();
      expect(mockRepository.getTasks()[0].title.getValue()).toBe('Test Task');
      expect(mockRepository.getTasks()[0].description).toBe('Test Description');
      expect(mockRepository.getTasks()[0].status).toBe(TaskStatusEnum.PENDING);
    });

    it('should throw an error if the description is empty', async () => {
      const command = {
        title: 'Task with no description',
        description: '',
      };

      await expect(useCase.execute(command)).rejects.toThrow(
        'Description is required'
      );
    });
  });

  describe('Validation Errors', () => {
    it('should throw error for empty title', async () => {
      const command = {
        title: '',
        description: 'Some description',
        id: uuidv4(),
      };

      await expect(useCase.execute(command)).rejects.toThrow(
        'Title is required'
      );
      expect(mockRepository.getTaskCount()).toBe(0);
    });

    it('should throw error for null values', async () => {
      const command = {
        title: null as any,
        description: 'Description',
        id: uuidv4(),
      };

      await expect(useCase.execute(command)).rejects.toThrow(
        'Title is required'
      );
      expect(mockRepository.getTaskCount()).toBe(0);
    });
  });

  describe('Repository Error Handling', () => {
    it('should propagate repository errors', async () => {
      const command = {
        title: 'Test Task',
        description: 'Test Description',
        id: uuidv4(),
      };

      mockRepository.simulateFailure('Database connection failed');

      await expect(useCase.execute(command)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should not save task if repository throws', async () => {
      const command = {
        title: 'Test Task',
        description: 'Test Description',
        id: uuidv4(),
      };

      mockRepository.simulateFailure('Save failed');

      try {
        await useCase.execute(command);
      } catch (error) {
        // Expected to throw
      }

      expect(mockRepository.getTaskCount()).toBe(0);
    });
  });

  describe('Use Case Behavior', () => {
    it('should return the created task', async () => {
      const command = {
        title: 'Return Test',
        description: 'Return Description',
        id: uuidv4(),
      };

      const result = await useCase.execute(command);
      const savedTask = mockRepository.getTasks()[0];

      expect(result).toBeDefined();
      expect(result.id.getValue()).toBe(savedTask.id.getValue());
      expect(result.title).toBe(savedTask.title);
    });

    it('should create multiple tasks independently', async () => {
      const command1 = {
        title: 'Task 1',
        description: 'Description 1',
        id: uuidv4(),
      };

      const command2 = {
        title: 'Task 2',
        description: 'Description 2',
        id: uuidv4(),
      };

      const result1 = await useCase.execute(command1);
      const result2 = await useCase.execute(command2);

      expect(result1.id.getValue()).not.toBe(result2.id.getValue());
      expect(mockRepository.getTaskCount()).toBe(2);
    });
  });
});
