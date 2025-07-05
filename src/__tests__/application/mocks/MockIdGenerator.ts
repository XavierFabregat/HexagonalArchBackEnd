import { IdGenerator } from '@application/ports/IdGenerator';
import { v4 as uuidv4 } from 'uuid';

export class MockIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
