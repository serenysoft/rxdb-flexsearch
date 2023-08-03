import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDatabaseSearch } from '../src';

export const userSchema = {
  version: 0,
  description: 'The user schema',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    age: {
      type: 'integer',
    },
  },
};

export async function initDatabase(options?: any): Promise<RxDatabaseSearch> {
  const database = await createRxDatabase({
    name: 'testdb',
    storage: getRxStorageMemory(),
    options: {
      search: { tokenize: 'full' },
    },
    ...options,
  });

  return database as RxDatabaseSearch;
}
