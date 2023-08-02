import { RxDatabase, addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBFlexSearchPlugin } from '../src';
import { userSchema } from './database';

describe('Replication', () => {
  let database: RxDatabase;

  beforeAll(() => {
    addRxPlugin(RxDBFlexSearchPlugin);
  });

  beforeEach(async () => {
    database = await createRxDatabase({
      name: 'testdb',
      storage: getRxStorageMemory(),
    });

    await database.addCollections({
      users: {
        schema: userSchema,
      },
    });
  });

  afterEach(async () => {
    await database.destroy();
  });

  it('should update index', async () => {
    const collection = database.users as any;

    await collection.insert({
      id: '1',
      name: 'Bill Gates',
      age: 67,
    });

    await collection.insert({
      id: '2',
      name: 'Linus Torvalds',
      age: 53,
    });

    let results = await collection.search('rval');
    const data = results.map((document: any) => document.toMutableJSON());

    expect(data).toEqual(
      expect.objectContaining([
        {
          id: '2',
          name: 'Linus Torvalds',
          age: 53,
        },
      ])
    );

    let user = await collection.findOne('1').exec();
    await user.patch({
      name: 'Max Lynch',
      age: 53,
    });

    results = await collection.search('bill');
    expect(results.length).toBe(0);

    user = await collection.findOne('2').exec();
    await user.remove();

    results = await collection.search('bill');
    expect(results.length).toBe(0);
  });
});
