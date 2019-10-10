# react-lit-store

⚡️ A lightweight state management tool for React.js

![npm](https://img.shields.io/npm/v/react-lit-store.svg)
![npm bundle
size](https://img.shields.io/bundlephobia/minzip/react-lit-store.svg)
[![Build
Status](https://travis-ci.org/QingqiShi/react-lit-store.svg?branch=master)](https://travis-ci.org/QingqiShi/react-lit-store)
[![codecov](https://codecov.io/gh/QingqiShi/react-lit-store/branch/master/graph/badge.svg)](https://codecov.io/gh/QingqiShi/react-lit-store)

<hr>

## Motivation

The most popular state management solution for React today is Redux. There are two
issues with using it:

1. Using Redux will increase your bundle size by 2.6kb
   (redux) + 5.5kb (react-redux) = 8.1kb after gzip. (source
   [here](https://bundlephobia.com/result?p=redux@4.0.4) and
   [here](https://bundlephobia.com/result?p=react-redux@7.1.1))
2. Many things rely on contractual agreement, which means that you can't catch
   type errors and you won't get IDE suggestions. For example it is the
   developer's responsibility to ensure the same type and payload is dispatched
   in the actions as accepted in the reducers.

## Solution

This library tries to solve that by leveraging the Context API and Hooks from
the latest React. With react-lit-store, you get strong type check as well as
great IDE suggestions. At the same time, our target bundle size is less than 1.5kb.

## Installation

```
> npm i react-lit-store
```

## Example (Typescript)

To create a store, all you need to do is provide an initial state and a
mutations object:

```ts
/* counterStore.ts */
import { createStore } from "libs/lit-store";

const initialState = { count: 3 };
type State = typeof initialState;

const mutations = {
  add: (prevState: State, amount: number) => ({
    count: prevState.count + amount
  })
};

const store = createStore(initialState, mutations);
export default store;
```

The mutations object is just a map between mutation names and
update functions. Every mutation receives the previous state as the first
argument, and the rest of the arguments are up to you. The update functions
should return objects which will be merged with the state.

To use the store, you need to first wrap the app in the store provider:

```tsx
/* App.tsx */
import React from "react";
import CounterButton from "./CounterButton.tsx";
import counterStore from "./counterStore.ts";

function App() {
  return (
    <counterStore.Provider>
      <CounterButton />
    </counterStore.Provider>
  );
}

export default App;
```

You can then use the store in any of your components:

```tsx
/* CounterButton.tsx */
import React from "react";
import counterStore from "./counterStore.ts";

function CounterButton() {
  const [state, actions] = counterStore.useStore();
  const handleClick = () => {
    actions.add(5);
  };

  return (
    <button type="button" onClick={handleClick}>
      {state.count}
    </button>
  );
}
```

Actions are just named functions that, when called, fires the mutations defined
using the arguments provided. Both `state` and `actions` will get full IDE integration will suggestions
and
type checking.

If your application requires many global state, we recommend splitting your
states into seperate stores, and only import them in your components as needed.
This will help minimise unnessesary rerenders.

A utility function `useStoreProvider` can be used to help you avoid the ugly nesting of store
providers when you have many stores.

```tsx
/* App.tsx */
import React from "react";
import storeA from "./storeA";
import storeB from "./storeB";
/* ... */
import { useStoreProvider } from "libs/lit-store";

function App() {
  const StoreProvider = useStoreProvider(storeA, storeB /* ... */);

  return <StoreProvider>{/* ... */}</StoreProvider>;
}

export default App;
```

## JavaScript Example

You don't have to use typescript (but then of course you won't get all the
typechecking and IDE suggestions). Here's an example of a store created with
pure JavaScript.

```js
/* counterStore.ts */
import { createStore } from "libs/lit-store";

const initialState = { count: 3 };
const mutations = {
  add: (prevState, amount) => ({
    count: prevState.count + amount
  })
};

const store = createStore(initialState, mutations);
export default store;
```

## Compatibility

`react-lit-store` is compile to ES5, and requires React 16.8 or higher as a peer
dependency.

If you don't need to support older browsers, you can also import the following
for even smaller bundle size (however for maximum compatibility we recommend the
standard import):

```ts
import { createStore, useStoreProvider } from "react-lit-store/index.es";
```
