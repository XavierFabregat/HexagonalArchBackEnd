import { Task } from '@domain/entities/Task';
import { TaskStatusEnum } from '@domain/value-objects/TaskStatus';
import { TaskId } from '@domain/value-objects/TaskId';
import { v4 as uuidv4 } from 'uuid';
import { TaskTitle } from '@domain/value-objects/TaskTitle';
import { TaskDescription } from '../../../domain/value-objects/TaskDescription';

describe('Task Entity', () => {
  let validTaskId: TaskId;
  let anotherTaskId: TaskId;
  let validTaskTitle: TaskTitle;
  let validTaskDescription: TaskDescription;
  beforeEach(() => {
    validTaskId = TaskId.from(uuidv4());
    anotherTaskId = TaskId.from(uuidv4());
    validTaskTitle = TaskTitle.create('Buy groceries');
    validTaskDescription = TaskDescription.create('Milk, eggs, bread');
  });

  describe('Task Creation', () => {
    describe('Valid Task Creation', () => {
      it('should create a task with valid parameters', () => {
        const task = Task.create(
          validTaskTitle,
          validTaskDescription,
          validTaskId
        );

        expect(task.title).toBe(validTaskTitle);
        expect(task.description.getValue()).toBe(
          validTaskDescription.getValue()
        );
        expect(task.status).toBe(TaskStatusEnum.PENDING);
        expect(task.id).toBe(validTaskId);
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
        expect(task.createdAt.getTime()).toBe(task.updatedAt.getTime());
      });

      it('should create tasks with different IDs', () => {
        const task1 = Task.create(
          validTaskTitle,
          validTaskDescription,
          validTaskId
        );
        const task2 = Task.create(
          validTaskTitle,
          validTaskDescription,
          anotherTaskId
        );

        expect(task1.id).not.toBe(task2.id);
        expect(task1.id.equals(task2.id)).toBe(false);
      });

      it('should set creation and update time to same moment', () => {
        const beforeCreation = new Date();
        const task = Task.create(
          validTaskTitle,
          validTaskDescription,
          validTaskId
        );
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
  });

  describe('Task Reconstruction from Persistence', () => {
    it('should reconstruct task from persistence data', () => {
      const createdAt = new Date('2023-01-01T10:00:00Z');
      const updatedAt = new Date('2023-01-02T15:30:00Z');
      const taskId = uuidv4();

      const task = Task.fromPersistence({
        id: taskId,
        title: validTaskTitle.getValue(),
        description: validTaskDescription.getValue(),
        status: TaskStatusEnum.IN_PROGRESS,
        createdAt,
        updatedAt,
      });

      expect(task.id.getValue()).toBe(taskId);
      expect(task.title.getValue()).toBe(validTaskTitle.getValue());
      expect(task.description.getValue()).toBe(validTaskDescription.getValue());
      expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);
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
        status: TaskStatusEnum.PENDING,
      });

      const inProgressTask = Task.fromPersistence({
        ...baseData,
        status: TaskStatusEnum.IN_PROGRESS,
      });

      const completedTask = Task.fromPersistence({
        ...baseData,
        status: TaskStatusEnum.COMPLETED,
      });

      expect(pendingTask.status).toBe(TaskStatusEnum.PENDING);
      expect(inProgressTask.status).toBe(TaskStatusEnum.IN_PROGRESS);
      expect(completedTask.status).toBe(TaskStatusEnum.COMPLETED);
    });
  });

  describe('Task Persistence', () => {
    it('should persist task correctly', () => {
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );
      const persistence = task.toPersistence();
      expect(persistence.title).toBe(validTaskTitle.getValue());
      expect(persistence.description).toBe(validTaskDescription.getValue());
      expect(persistence.status).toBe(TaskStatusEnum.PENDING);
      expect(persistence.id).toBe(validTaskId.getValue());
    });
  });

  describe('Task Title Updates', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create(validTaskTitle, validTaskDescription, validTaskId);
    });

    it('should update title successfully', () => {
      const originalUpdatedAt = task.updatedAt;

      // Small delay to ensure timestamp difference
      jest.useFakeTimers();
      jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

      const newTitle = TaskTitle.create('New Title');
      task.updateTitle(newTitle.getValue());

      expect(task.title.getValue()).toBe(newTitle.getValue());
      expect(task.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    it('should trim whitespace when updating title', () => {
      const newTitle = TaskTitle.create('  Trimmed Title  ');
      task.updateTitle(newTitle.getValue());
      expect(task.title.getValue()).toBe(newTitle.getValue());
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
      expect(() => task.updateTitle('')).toThrow('Title is required');
    });

    it('should throw error when updating title to whitespace only', () => {
      expect(() => task.updateTitle('   ')).toThrow('Title is required');
    });

    it('should throw error when updating title to null', () => {
      expect(() => task.updateTitle(null as any)).toThrow('Title is required');
    });

    it('should throw error when updating title to undefined', () => {
      expect(() => task.updateTitle(undefined as any)).toThrow(
        'Title is required'
      );
    });
  });

  describe('Task Description Updates', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create(validTaskTitle, validTaskDescription, validTaskId);
    });

    it('should update description successfully', () => {
      const originalUpdatedAt = task.updatedAt;

      jest.useFakeTimers();
      jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

      const newDescription = TaskDescription.create('New Description');
      task.updateDescription(newDescription.getValue());

      expect(task.description.getValue()).toBe(newDescription.getValue());
      expect(task.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      jest.useRealTimers();
    });

    it('should trim whitespace when updating description', () => {
      const newDescription = TaskDescription.create('  Trimmed Description  ');
      task.updateDescription(newDescription.getValue());
      expect(task.description.getValue()).toBe(newDescription.getValue());
    });

    it('should not allow empty description when updating', () => {
      expect(() => task.updateDescription('')).toThrow(
        'Description is required'
      );
    });

    it('should not allow description with only whitespace (trimmed to empty)', () => {
      expect(() => task.updateDescription('   ')).toThrow(
        'Description is required'
      );
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
      task = Task.create(validTaskTitle, validTaskDescription, validTaskId);
    });

    describe('Mark as In Progress', () => {
      it('should mark pending task as in progress', () => {
        expect(task.status).toBe(TaskStatusEnum.PENDING);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsInProgress();

        expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should throw error when marking in-progress task as in progress', () => {
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);

        expect(() => task.markAsInProgress()).toThrow(
          'Only pending tasks can be marked as in progress'
        );
      });

      it('should throw error when marking completed task as in progress', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatusEnum.COMPLETED);

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
        expect(task.status).toBe(TaskStatusEnum.PENDING);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatusEnum.COMPLETED);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should mark in-progress task as completed', () => {
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);

        const originalUpdatedAt = task.updatedAt;
        jest.useFakeTimers();
        jest.setSystemTime(originalUpdatedAt.getTime() + 1000);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatusEnum.COMPLETED);
        expect(task.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );

        jest.useRealTimers();
      });

      it('should throw error when marking completed task as completed again', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatusEnum.COMPLETED);

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
        expect(task.status).toBe(TaskStatusEnum.PENDING);

        // Move to in progress
        task.markAsInProgress();
        expect(task.status).toBe(TaskStatusEnum.IN_PROGRESS);

        // Move to completed
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatusEnum.COMPLETED);
      });

      it('should allow direct transition: pending → completed', () => {
        expect(task.status).toBe(TaskStatusEnum.PENDING);

        task.markAsCompleted();

        expect(task.status).toBe(TaskStatusEnum.COMPLETED);
      });

      it('should not allow any transitions from completed', () => {
        task.markAsCompleted();
        expect(task.status).toBe(TaskStatusEnum.COMPLETED);

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
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );
      const json = task.toJSON();

      expect(json).toEqual({
        id: validTaskId.toString(),
        title: validTaskTitle.getValue(),
        description: validTaskDescription.getValue(),
        status: TaskStatusEnum.PENDING,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });

    it('should serialize task with all statuses correctly', () => {
      const pendingTask = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );
      const inProgressTask = Task.create(
        validTaskTitle,
        validTaskDescription,
        anotherTaskId
      );
      inProgressTask.markAsInProgress();

      const completedTask = Task.create(
        validTaskTitle,
        validTaskDescription,
        TaskId.from(uuidv4())
      );
      completedTask.markAsCompleted();

      expect(pendingTask.toJSON().status).toBe(TaskStatusEnum.PENDING);
      expect(inProgressTask.toJSON().status).toBe(TaskStatusEnum.IN_PROGRESS);
      expect(completedTask.toJSON().status).toBe(TaskStatusEnum.COMPLETED);
    });

    it('should serialize task with updated fields correctly', () => {
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );

      // simulate a delay of 1 second
      jest.useFakeTimers();
      jest.setSystemTime(task.createdAt.getTime() + 1000);

      const newTitle = TaskTitle.create('Updated Title');

      task.updateTitle(newTitle.getValue());
      task.updateDescription('Updated Description');
      task.markAsInProgress();

      const json = task.toJSON();

      expect(json.title).toBe(newTitle.getValue());
      expect(json.description).toBe('Updated Description');
      expect(json.status).toBe(TaskStatusEnum.IN_PROGRESS);
      expect(json.updatedAt.getTime()).toBeGreaterThan(
        json.createdAt.getTime()
      );
    });
  });

  describe('Task Immutability Guarantees', () => {
    let task: Task;

    beforeEach(() => {
      task = Task.create(validTaskTitle, validTaskDescription, validTaskId);
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
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );

      // Should not allow empty title updates at any status
      expect(() => task.updateTitle('')).toThrow('Title is required');

      task.markAsInProgress();
      expect(() => task.updateTitle('')).toThrow('Title is required');

      task.markAsCompleted();
      expect(() => task.updateTitle('')).toThrow('Title is required');
    });

    it('should allow description updates at any status', () => {
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );

      task.updateDescription('Pending Description');
      expect(task.description.getValue()).toBe('Pending Description');

      task.markAsInProgress();
      task.updateDescription('In Progress Description');
      expect(task.description.getValue()).toBe('In Progress Description');

      task.markAsCompleted();
      task.updateDescription('Completed Description');
      expect(task.description.getValue()).toBe('Completed Description');
    });

    it('should maintain temporal consistency', () => {
      const task = Task.create(
        validTaskTitle,
        validTaskDescription,
        validTaskId
      );
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
