# [RxDB](https://rxdb.info) - [FlexSearch](https://github.com/nextapps-de/flexsearch) plugin

[![Build Status](https://github.com/serenysoft/rxdb-flexsearch/actions/workflows/ci.yml/badge.svg)](https://github.com/serenysoft/rxdb-flexsearch/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/serenysoft/rxdb-flexsearch/branch/main/graph/badge.svg?token=Mur8A2Z2Rb)](https://codecov.io/gh/serenysoft/rxdb-flexsearch)

## Install

```cli
npm i rxdb-flexsearch flexsearch@0.7.21 --save
```

## Usage

```js
import { addRxPlugin } from 'rxdb';
import { RxDBFlexSearchPlugin } from 'rxdb-flexsearch';

addRxPlugin(RxDBFlexSearchPlugin);

...

const results = await collection.search(query: string);
console.log(results);

```

## Import/Export indexes

```js

const results = await database.exportIndexes((key, data) => {
  localStorage.setItem(key, data);
});


const results = await database.exportIndexes({
  [key]: localStorage.getItem(key);
});

```


