import { RxCollection, RxDocument, RxPlugin } from 'rxdb';
import { Index } from 'flexsearch';

export type RxCollectionSearch<RxDocType = any> = RxCollection<RxDocType> & {
  $index: Index;
  search(this: RxCollectionSearch, query: string): Promise<RxDocument[]>;
};

function createText(data: any, searchFields: string[]): string {
  return searchFields
    .map((field) => data[field])
    .filter((value) => value)
    .join(' ');
}

async function search(this: RxCollectionSearch, query: string): Promise<RxDocument[]> {
  const ids = this.$index.search(query) as string[];
  const results = await this.findByIds(ids).exec();
  return Array.from(results.values());
}

export function initialize(collection: RxCollection) {
  const index = new Index({
    tokenize: 'full',
  });
  const { primaryPath } = collection.schema;
  const { properties } = collection.schema.jsonSchema;
  const searchFields = collection.options.searchFields || Object.keys(properties);

  (collection as RxCollectionSearch).$index = index;

  collection.postRemove((data) => {
    index.remove(data[primaryPath]);
  }, false);

  collection.postSave((data) => {
    index.add(data[primaryPath], createText(data, searchFields));
  }, false);

  collection.postInsert((data) => {
    const text = createText(data, searchFields);
    index.add(data[primaryPath], text);
  }, false);
}

export const RxDBFlexSearchPlugin: RxPlugin = {
  name: 'flexsearch',
  rxdb: true,
  prototypes: {
    RxCollection(proto: any) {
      proto.search = search;
    },
  },
  hooks: {
    createRxCollection: {
      after: (i) => {
        initialize(i.collection);
      },
    },
  },
};
