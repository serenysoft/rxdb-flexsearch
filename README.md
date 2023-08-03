# [RxDB](https://rxdb.info) - [FlexSearch](https://github.com/nextapps-de/flexsearch) plugin

[![Build Status](https://github.com/serenysoft/rxdb-flexsearch/actions/workflows/ci.yml/badge.svg)](https://github.com/serenysoft/rxdb-flexsearch/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/serenysoft/rxdb-flexsearch/branch/master/graph/badge.svg?token=Mur8A2Z2Rb)](https://codecov.io/gh/serenysoft/rxdb-flexsearch)

## Install

```cli
npm i rxdb-flexsearch flexsearch@0.7.21 --save
```

## Usage

```js
import { addRxPlugin } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { RxDBFlexSearchPlugin } from 'rxdb-flexsearch';
import { userSchema } from './schemas';

addRxPlugin(RxDBFlexSearchPlugin);

const database = await createRxDatabase({
  storage: getRxStorageMemory(),
});

await database.addCollections({
  users: {
    schema: userSchema,
    options: {
      searchable: true,
    },
  },
});

...

const results = await collection.search(query: string);
console.log(results);

```

## Import/Export indexes

```js

await database.exportIndexes((key, data) => {
  localStorage.setItem(key, data);
});


await database.exportIndexes({
  [key]: localStorage.getItem(key);
});

```

You can use the `autoIndexExport` database option to automatically export indexes when the collection is modified.

```js
const database = await createRxDatabase({
  storage: getRxStorageMemory(),
  options: {
    autoIndexExport: (key, value) => {
      localStorage.setItem(key, value);
    },
  }
});
```

