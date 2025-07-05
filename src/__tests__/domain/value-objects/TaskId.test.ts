import { TaskId } from '@domain/value-objects/TaskId';
import { v4 as uuidv4 } from 'uuid';

describe('TaskId Value Object', () => {
  let validUuid: string;
  let anotherUuid: string;
  let invalidUuidLength: string;
  let invalidUuidFormat: string;

  beforeEach(() => {
    validUuid = uuidv4();
    anotherUuid = uuidv4();
    invalidUuidLength = 'this is not a valid uuid';
    invalidUuidFormat = '123e4567-e89b-12d3-a456-426614174000';
  });

  describe('TaskId Creation', () => {
    it('should create a valid TaskId', () => {
      const taskId = TaskId.from(validUuid);
      expect(taskId).toBeDefined();
    });

    it('should throw an error if the uuid is not valid length', () => {
      expect(() => TaskId.from(invalidUuidLength)).toThrow(
        'TaskId must be a valid UUID'
      );
    });

    it('should throw an error if the uuid is empty', () => {
      expect(() => TaskId.from('')).toThrow('TaskId cannot be empty');
    });

    it('should throw an error if the uuid is not valid format', () => {
      expect(() => TaskId.from(invalidUuidFormat)).toThrow(
        'TaskId must be a valid UUID'
      );
    });
  });

  describe('TaskId Getter', () => {
    it('should return the correct uuid', () => {
      const taskId = TaskId.from(validUuid);
      expect(taskId.getValue()).toBe(validUuid);
    });
  });

  describe('TaskId Equality', () => {
    it('should return true if the uuids are the same', () => {
      const taskId = TaskId.from(validUuid);
      const anotherTaskId = TaskId.from(validUuid);
      expect(taskId.equals(anotherTaskId)).toBe(true);
    });

    it('should return false if the uuids are different', () => {
      const taskId = TaskId.from(validUuid);
      const anotherTaskId = TaskId.from(anotherUuid);
      expect(taskId.equals(anotherTaskId)).toBe(false);
    });
  });

  describe('TaskId Serialization', () => {
    it('should return the correct uuid', () => {
      const taskId = TaskId.from(validUuid);
      expect(taskId.getValue()).toBe(validUuid);
    });
  });
});
