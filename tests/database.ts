import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

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

export async function initDatabase() {
  const database = await createRxDatabase({
    name: 'testdb',
    storage: getRxStorageMemory(),
  });

  await database.addCollections({
    users: {
      schema: userSchema,
      options: {
        searchFields: ['name', 'age'],
      },
    },
  });

  return database;
}
