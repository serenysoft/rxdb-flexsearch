import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxCollectionSearch, RxDBFlexSearchPlugin, RxDatabaseSearch } from '../src';
import { initDatabase, userSchema } from './database';

describe('Replication', () => {
  let database: RxDatabaseSearch;

  beforeAll(() => {
    addRxPlugin(RxDBFlexSearchPlugin);
    addRxPlugin(RxDBDevModePlugin);
  });

  afterEach(async () => {
    await database.remove();
  });

  it('should update index', async () => {
    database = await initDatabase();

    await database.addCollections({
      users: {
        schema: userSchema,
        options: {
          searchable: true,
        },
      },
    });

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

  it('should import/export indexes', async () => {
    let indexId: string;
    let indexData: string;

    database = await initDatabase();

    await database.addCollections({
      users: {
        schema: userSchema,
        options: {
          searchable: true,
        },
      },
    });

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

  it('should auto export indexes', async () => {
    database = await initDatabase({
      options: {
        autoIndexStore: (key: string, value: string) => {
          expect(key).toEqual('users');
          expect(value).toBeTruthy();
        },
      },
    });

    await database.addCollections({
      users: {
        schema: userSchema,
        options: {
          searchable: true,
        },
      },
    });

    await database.users.insert({
      id: '1',
      name: 'Mark Zuckerberg',
      age: 39,
    });
  });
});
