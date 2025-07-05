import { IdGenerator } from '@application/ports/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
