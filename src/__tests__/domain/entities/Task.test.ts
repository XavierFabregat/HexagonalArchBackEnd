import { Task, TaskStatus } from '@domain/entities/Task';
import { TaskId } from '@domain/value-objects/TaskId';
import { v4 as uuidv4 } from 'uuid';

describe('Task Entity', () => {
  let validTaskId: TaskId;
  let anotherTaskId: TaskId;

  beforeEach(() => {
    validTaskId = TaskId.from(uuidv4());
    anotherTaskId = TaskId.from(uuidv4());
  });

  describe('Task Creation', () => {
    describe('Valid Task Creation', () => {
      it('should create a task with valid parameters', () => {
        const task = Task.create(
          'Buy groceries',
          'Milk, eggs, bread',
          validTaskId
        );

        expect(task.title).toBe('Buy groceries');
        expect(task.description).toBe('Milk, eggs, bread');
        expect(task.status).toBe(TaskStatus.PENDING);
        expect(task.id).toBe(validTaskId);
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
        expect(task.createdAt.getTime()).toBe(task.updatedAt.getTime());
      });

      it('should not create a task with empty description', () => {
        expect(() => Task.create('Buy groceries', '', validTaskId)).toThrow(
          'Title, description and id are required'
        );
      });

      it('should create tasks with different IDs', () => {
        const task1 = Task.create('Task 1', 'Description 1', validTaskId);
        const task2 = Task.create('Task 2', 'Description 2', anotherTaskId);

        expect(task1.id).not.toBe(task2.id);
        expect(task1.id.equals(task2.id)).toBe(false);
      });

      it('should set creation and update time to same moment', () => {
        const beforeCreation = new Date();
        const task = Task.create('Test Task', 'Test Description', validTaskId);
        const afterCreation = new Date();

        expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreation.getTime()
        );
        expect(task.createdAt.getTime()).toBeLessThanOrEqual(
          afterCreation.getTime()
        );
        expect(task.updatedAt.getTime()).toBe(task.createdAt.getTime());
      });
    });

    describe('Invalid Task Creation', () => {
      it('should throw error when title is null', () => {
        expect(() =>
          Task.create(null as any, 'Description', validTaskId)
        ).toThrow('Title, description and id are required');
      });

      it('should throw error when title is undefined', () => {
        expect(() =>
          Task.create(undefined as any, 'Description', validTaskId)
        ).toThrow('Title, description and id are required');
      });

      it('should throw error when title is empty string', () => {
        expect(() => Task.create('', 'Description', validTaskId)).toThrow(
          'Title, description and id are required'
        );
      });

      it('should throw error when description is null', () => {
        expect(() => Task.create('Title', null as any, validTaskId)).toThrow(
          'Title, description and id are required'
        );
      });

      it('should throw error when description is undefined', () => {
        expect(() =>
          Task.create('Title', undefined as any, validTaskId)
        ).toThrow('Title, description and id are required');
      });

      it('should throw error when id is null', () => {
        expect(() => Task.create('Title', 'Description', null as any)).toThrow(
          'Title, description and id are required'
        );
      });

      it('should throw error when id is undefined', () => {
        expect(() =>
          Task.create('Title', 'Description', undefined as any)
        ).toThrow('Title, description and id are required');
      });
    });
  });

  describe('Task Reconstruction from Persistence', () => {
    it('should reconstruct task from persistence data', () => {
      const createdAt = new Date('2023-01-01T10:00:00Z');
      const updatedAt = new Date('2023-01-02T15:30:00Z');
      const taskId = uuidv4();

      const task = Task.fromPersistence({
        id: taskId,
        title: 'Persisted Task',
        description: 'Persisted Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt,
        updatedAt,
      });

      expect(task.id.getValue()).toBe(taskId);
      expect(task.title).toBe('Persisted Task');
      expect(task.description).toBe('Persisted Description');
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.createdAt).toBe(createdAt);
      expect(task.updatedAt).toBe(updatedAt);
    });

    it('should handle all task statuses when reconstructing', () => {
      const baseData = {
        id: uuidv4(),
        title: 'Test Task',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const pendingTask = Task.fromPersistence({
        ...baseData,
        status: TaskStatus.PENDING,
      });

      const inProgressTask = Task.fromPersistence({
        ...baseData,
        status: TaskStatus.IN_PROGRESS,
      });

      const completedTask = Task.fromPersistence({
        ...baseData,
        status: TaskStatus.COMPLETED,
      });

      expect(pendingTask.status).toBe(TaskStatus.PENDING);
      expect(inProgressTask.status).toBe(TaskStatus.IN_PROGRESS);
      expect(completedTask.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe('Task Title Updates', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create('Original Title', 'Original Description', validTaskId);
    });

    it('should update title successfully', () => {
      const originalUpdatedAt = task.updatedAt;

      // Small delay to ensure timestamp difference
      jest.useFakeTimers();
      jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

      task.updateTitle('New Title');

      expect(task.title).toBe('New Title');
      expect(task.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    it('should trim whitespace when updating title', () => {
      task.updateTitle('  Trimmed Title  ');
      expect(task.title).toBe('Trimmed Title');
    });

    it('should preserve other fields when updating title', () => {
      const originalDescription = task.description;
      const originalStatus = task.status;
      const originalCreatedAt = task.createdAt;
      const originalId = task.id;

      task.updateTitle('Updated Title');

      expect(task.description).toBe(originalDescription);
      expect(task.status).toBe(originalStatus);
      expect(task.createdAt).toBe(originalCreatedAt);
      expect(task.id).toBe(originalId);
    });

    it('should throw error when updating title to empty string', () => {
      expect(() => task.updateTitle('')).toThrow('Title cannot be empty');
    });

    it('should throw error when updating title to whitespace only', () => {
      expect(() => task.updateTitle('   ')).toThrow('Title cannot be empty');
    });

    it('should throw error when updating title to null', () => {
      expect(() => task.updateTitle(null as any)).toThrow(
        'Title cannot be empty'
      );
    });

    it('should throw error when updating title to undefined', () => {
      expect(() => task.updateTitle(undefined as any)).toThrow(
        'Title cannot be empty'
      );
    });
  });

  describe('Task Description Updates', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create('Test Title', 'Original Description', validTaskId);
    });

    it('should update description successfully', () => {
      const originalUpdatedAt = task.updatedAt;

      jest.useFakeTimers();
      jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

      task.updateDescription('New Description');

      expect(task.description).toBe('New Description');
      expect(task.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    it('should trim whitespace when updating description', () => {
      task.updateDescription('  Trimmed Description  ');
      expect(task.description).toBe('Trimmed Description');
    });

    it('should allow empty description when updating', () => {
      task.updateDescription('');
      expect(task.description).toBe('');
    });

    it('should allow description with only whitespace (trimmed to empty)', () => {
      task.updateDescription('   ');
      expect(task.description).toBe('');
    });

    it('should preserve other fields when updating description', () => {
      const originalTitle = task.title;
      const originalStatus = task.status;
      const originalCreatedAt = task.createdAt;
      const originalId = task.id;

      task.updateDescription('Updated Description');

      expect(task.title).toBe(originalTitle);
      expect(task.status).toBe(originalStatus);
      expect(task.createdAt).toBe(originalCreatedAt);
      expect(task.id).toBe(originalId);
    });
  });

  describe('Task Status Transitions', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create('Test Task', 'Test Description', validTaskId);
    });

    describe('Mark as In Progress', () => {
      it('should mark pending task as in progress', () => {
        expect(task.status).toBe(TaskStatus.PENDING);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsInProgress();

        expect(task.status).toBe(TaskStatus.IN_PROGRESS);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should throw error when marking in-progress task as in progress', () => {
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatus.IN_PROGRESS);

        expect(() => task.markAsInProgress()).toThrow(
          'Only pending tasks can be marked as in progress'
        );
      });

      it('should throw error when marking completed task as in progress', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatus.COMPLETED);

        expect(() => task.markAsInProgress()).toThrow(
          'Only pending tasks can be marked as in progress'
        );
      });

      it('should preserve other fields when marking as in progress', () => {
        const originalTitle = task.title;
        const originalDescription = task.description;
        const originalCreatedAt = task.createdAt;
        const originalId = task.id;

        task.markAsInProgress();

        expect(task.title).toBe(originalTitle);
        expect(task.description).toBe(originalDescription);
        expect(task.createdAt).toBe(originalCreatedAt);
        expect(task.id).toBe(originalId);
      });
    });

    describe('Mark as Completed', () => {
      it('should mark pending task as completed', () => {
        expect(task.status).toBe(TaskStatus.PENDING);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatus.COMPLETED);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should mark in-progress task as completed', () => {
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatus.IN_PROGRESS);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatus.COMPLETED);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should throw error when marking completed task as completed again', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatus.COMPLETED);

        expect(() => task.markAsCompleted()).toThrow(
          'Task is already completed'
        );
      });

      it('should preserve other fields when marking as completed', () => {
        const originalTitle = task.title;
        const originalDescription = task.description;
        const originalCreatedAt = task.createdAt;
        const originalId = task.id;

        task.markAsCompleted();

        expect(task.title).toBe(originalTitle);
        expect(task.description).toBe(originalDescription);
        expect(task.createdAt).toBe(originalCreatedAt);
        expect(task.id).toBe(originalId);
      });
    });

    describe('Status Transition Scenarios', () => {
      it('should allow complete workflow: pending → in progress → completed', () => {
        // Start as pending
        expect(task.status).toBe(TaskStatus.PENDING);

        // Move to in progress
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatus.IN_PROGRESS);

        // Move to completed
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatus.COMPLETED);
      });

      it('should allow direct transition: pending → completed', () => {
        expect(task.status).toBe(TaskStatus.PENDING);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatus.COMPLETED);
      });

      it('should not allow any transitions from completed', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatus.COMPLETED);

        // No valid transitions from completed
        expect(() => task.markAsInProgress()).toThrow(
          'Only pending tasks can be marked as in progress'
        );
        expect(() => task.markAsCompleted()).toThrow(
          'Task is already completed'
        );
      });
    });
  });

  describe('Task Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const task = Task.create('Test Task', 'Test Description', validTaskId);
      const json = task.toJSON();

      expect(json).toEqual({
        id: validTaskId.toString(),
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });

    it('should serialize task with all statuses correctly', () => {
      const pendingTask = Task.create(
        'Pending Task',
        'Description',
        validTaskId
      );
      const inProgressTask = Task.create(
        'In Progress Task',
        'Description',
        anotherTaskId
      );
      inProgressTask.markAsInProgress();

      const completedTask = Task.create(
        'Completed Task',
        'Description',
        TaskId.from(uuidv4())
      );
      completedTask.markAsCompleted();

      expect(pendingTask.toJSON().status).toBe(TaskStatus.PENDING);
      expect(inProgressTask.toJSON().status).toBe(TaskStatus.IN_PROGRESS);
      expect(completedTask.toJSON().status).toBe(TaskStatus.COMPLETED);
    });

    it('should serialize task with updated fields correctly', () => {
      const task = Task.create('Original', 'Original Description', validTaskId);

      // simulate a delay of 1 second
      jest.useFakeTimers();
      jest.setSystemTime(task.createdAt.getTime() + 1000);

      task.updateTitle('Updated Title');
      task.updateDescription('Updated Description');
      task.markAsInProgress();

      const json = task.toJSON();

      expect(json.title).toBe('Updated Title');
      expect(json.description).toBe('Updated Description');
      expect(json.status).toBe(TaskStatus.IN_PROGRESS);
      expect(json.updatedAt.getTime()).toBeGreaterThan(
        json.createdAt.getTime()
      );
    });
  });

  describe('Task Immutability Guarantees', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create('Test Task', 'Test Description', validTaskId);
    });

    it('should not allow external modification of ID', () => {
      const id = task.id;
      expect(id).toBe(validTaskId);

      // The ID should be the same reference (TaskId is immutable)
      expect(task.id).toBe(id);
    });

    it('should not allow external modification of creation date', () => {
      const createdAt = task.createdAt;

      // Even if we try to modify the returned date, it shouldn't affect the task
      const returnedDate = task.createdAt;
      returnedDate.setTime(returnedDate.getTime() + 10000);

      expect(task.createdAt).toBe(createdAt);
    });

    it('should return consistent values across multiple calls', () => {
      const title1 = task.title;
      const title2 = task.title;
      const description1 = task.description;
      const description2 = task.description;

      expect(title1).toBe(title2);
      expect(description1).toBe(description2);
    });
  });

  describe('Task Business Rules', () => {
    it('should enforce title requirement throughout lifecycle', () => {
      const task = Task.create('Valid Title', 'Description', validTaskId);

      // Should not allow empty title updates at any status
      expect(() => task.updateTitle('')).toThrow('Title cannot be empty');

      task.markAsInProgress();
      expect(() => task.updateTitle('')).toThrow('Title cannot be empty');

      task.markAsCompleted();
      expect(() => task.updateTitle('')).toThrow('Title cannot be empty');
    });

    it('should allow description updates at any status', () => {
      const task = Task.create('Title', 'Original Description', validTaskId);

      task.updateDescription('Pending Description');
      expect(task.description).toBe('Pending Description');

      task.markAsInProgress();
      task.updateDescription('In Progress Description');
      expect(task.description).toBe('In Progress Description');

      task.markAsCompleted();
      task.updateDescription('Completed Description');
      expect(task.description).toBe('Completed Description');
    });

    it('should maintain temporal consistency', () => {
      const task = Task.create('Title', 'Description', validTaskId);
      const createdAt = task.createdAt;

      // updatedAt should never be before createdAt
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdAt.getTime()
      );

      // After updates, updatedAt should be >= createdAt
      task.updateTitle('New Title');
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdAt.getTime()
      );

      task.markAsInProgress();
      expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdAt.getTime()
      );
    });
  });
});
