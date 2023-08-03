import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxCollectionSearch, RxDBFlexSearchPlugin, RxDatabaseSearch } from '../src';
import { userSchema } from './database';

describe('Replication', () => {
  let database: RxDatabaseSearch;

  beforeAll(() => {
    addRxPlugin(RxDBFlexSearchPlugin);
    addRxPlugin(RxDBDevModePlugin);
  });

  beforeEach(async () => {
    database = (await createRxDatabase({
      name: 'testdb',
      storage: getRxStorageMemory(),
    })) as RxDatabaseSearch;

    await database.addCollections({
      users: {
        schema: userSchema,
        options: {
          searchable: true,
        },
      },
    });
  });

  afterEach(async () => {
    await database.remove();
  });

  it('should update index', async () => {
    const collection = database.users as RxCollectionSearch;

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
      age: 32,
    });

    results = await collection.search('bill');
    expect(results.length).toBe(0);

    user = await collection.findOne('2').exec();
    await user.remove();

    results = await collection.search('bill');
    expect(results.length).toBe(0);
  });

  it('should export/import indexes', async () => {
    let indexId: string;
    let indexData;
    const collection = database.users as RxCollectionSearch;

    await collection.insert({
      id: '1',
      name: 'Jeff Bezos',
      age: 59,
    });

    await database.exportIndexes((id: string, data: string) => {
      indexId = id;
      indexData = data;
    });

    await database.remove();
    await database.importIndexes({ [indexId]: indexData });

    const { $index } = collection;
    expect($index.contain('1')).toBe(true);
  });
});
