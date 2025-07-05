import { IdGenerator } from '@application/ports/IdGenerator';
import { CryptoIdGenerator } from './cryptoIdGenerator';
import { UuidV4Generator } from './uuidV4Generator';

export class IdGeneratorFactory {
  static createIdGenerator(type: 'crypto' | 'uuid'): IdGenerator {
    switch (type) {
      case 'crypto':
        return new CryptoIdGenerator();
      case 'uuid':
        return new UuidV4Generator();
      default:
        throw new Error(`Unknown id generator type: ${type}`);
    }
  }
}
