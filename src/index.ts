import { RxCollection, RxDatabase, RxDocument, RxPlugin } from 'rxdb';
import { Index, SearchOptions, Limit } from 'flexsearch';

export type RxExportIndexHandler = (key: string, value: string) => void | Promise<void>;

export interface RxDatabaseIndexMethods {
  exportIndexes(handler: RxExportIndexHandler): Promise<void>;
  importIndexes(values: Record<string, string>): Promise<void>;
}

export type RxDatabaseSearch = RxDatabase & RxDatabaseIndexMethods;

export type RxCollectionSearch<RxDocType = any> = RxCollection<RxDocType> & {
  $index: Index;
  search(
    this: RxCollectionSearch,
    query: string,
    options?: Limit | SearchOptions
  ): Promise<RxDocument[]>;
};

function serialize(data: any, searchFields: string[]): string {
  return searchFields
    .map((field) => data[field])
    .filter((value) => value)
    .join(' ');
}

async function exportIndexes(
  this: RxDatabase,
  handler: RxExportIndexHandler
): Promise<void> {
  const entries = Object.entries(this.collections);
  await Promise.all(
    entries.map(([key, collection]) => {
      const { $index } = collection as RxCollectionSearch;
      if ($index) {
        return $index.export((_, value) => handler(key, value));
      }
    })
  );
}

async function importIndexes(
  this: RxDatabase,
  values: Record<string, string>
): Promise<void> {
  const keys = Object.entries(values);
  await Promise.all(
    keys.map(([key, value]) => {
      const collection = this.collections[key];

      if (collection) {
        const { $index } = collection as RxCollectionSearch;
        if ($index) {
          return $index.import(key, value);
        }
      }
    })
  );
}

async function search(
  this: RxCollectionSearch,
  query: string,
  options?: Limit | SearchOptions
): Promise<RxDocument[]> {
  const ids = this.$index.search(query, options) as string[];
  const results = await this.findByIds(ids).exec();
  return Array.from(results.values());
}

export function initialize(collection: RxCollection) {
  const database = collection.database as RxDatabaseSearch;
  const { autoIndexExport, search } = database.options;

  const { primaryPath } = collection.schema;
  const { properties } = collection.schema.jsonSchema;
  const searchFields = collection.options.searchFields || Object.keys(properties);

  const index = new Index(search);

  (collection as RxCollectionSearch).$index = index;

  collection.postRemove((data) => {
    index.remove(data[primaryPath]);

    if (autoIndexExport) {
      index.export((_, data) => autoIndexExport(collection.name, data));
    }
  }, false);

  collection.postSave((data) => {
    index.add(data[primaryPath], serialize(data, searchFields));

    if (autoIndexExport) {
      index.export((_, data) => autoIndexExport(collection.name, data));
    }
  }, false);

  collection.postInsert((data) => {
    index.add(data[primaryPath], serialize(data, searchFields));

    if (autoIndexExport) {
      index.export((_, data) => autoIndexExport(collection.name, data));
    }
  }, false);
}

export const RxDBFlexSearchPlugin: RxPlugin = {
  name: 'flexsearch',
  rxdb: true,
  prototypes: {
    RxDatabase(proto: any) {
      proto.exportIndexes = exportIndexes;
      proto.importIndexes = importIndexes;
    },
    RxCollection(proto: any) {
      proto.search = search;
    },
  },
  hooks: {
    createRxCollection: {
      after: ({ collection }) => {
        if (collection.options?.searchable) {
          initialize(collection);
        }
      },
    },
  },
};
