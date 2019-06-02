# react-lit-store

⚡️ A lightweight state management tool for React.js

<hr>

![npm bundle
size](https://img.shields.io/bundlephobia/minzip/react-lit-store.svg)
[![Build
Status](https://travis-ci.org/QingqiShi/react-lit-store.svg?branch=master)](https://travis-ci.org/QingqiShi/react-lit-store)
[![codecov](https://codecov.io/gh/QingqiShi/react-lit-store/branch/master/graph/badge.svg)](https://codecov.io/gh/QingqiShi/react-lit-store)

## Motivation

Now that React.js has Context API and hooks, many may find Redux less nessesary.
However, running your own simple context store requires a little bit of
boilerplate code, and if you want to keep all your states in a single context, you may find it a bit tricky to optimise unnessesary renders.

## Solution

This library tries to solve that by providing a familiar way to create context
stores and connect them to components. The implementation uses the Context API
and hooks to make it super light weight. You don't actually have to use this
library, feel free to take it and modify for your own needs.

## Installation

```
> npm i react-lit-store
```

## Simple Example

Create a state store

```js
// store/counter.js
import { createStore } from "react-lit-store";

const initialState = {
  count: 0
};

const reducer = (prevState, action) {
  const { type, payload } = action;
  switch(type) {
    case "increase":
      return { count: prevState.count + 1 };
    case "decrease":
      return { count: prevState.count - 1 };
    case "set":
      return { count: payload };
  }
}

export default createStore(initialState, reducer);
```

Make the store available in your application

```js
// App.js
import React from "react";
import counter from "store/counter";

function App() {
  return (
    <counter.Provider>
      <div className="App">{/* ... */}</div>
    </counter.Provider>
  );
}

export default App;
```

You can also have multiple stores

```js
// App.js
import React from "react";
import { withStores } from "react-lit-store";
import counter from "store/counter";
import otherStore from "store/otherStore";

function App() {
  return <div className="App">{/* ... */}</div>;
}

export default withStores(App, counter, otherStore);
```

Access the store from your components

```js
// components/MyButton.js
import React from "react";
import counter from "store/counter";

function MyButton(props, states, dispatch) {
  const [count] = states;

  const handlePlusClick = () => dispatch({ type: "increase" });
  const handleMinusClick = () => dispatch({ type: "increase" });
  const handleSetClick = () => dispatch({ type: "increase", payload: 5 });

  return (
    <>
      <button onClick={handlePlusClick}>+</button>
      <button onClick={handleMinusClick}>-</button>
      <button onClick={handleSetClick}>Set</button>
      {count}
    </>
  );
}

export default counter.connect(App, state => [state.count]);
```

## API Reference

### `createStore(initialState, reducer)`

Returns the store object.

`initialState` - An object used as the initial state. It is recommended to
initialise all states in your store here.

`reducer` - A function that takes the previous State and the action object, and
returns a partial state used to update the context.

- `(prevState, action) => partialState`
  - `prevState` is just the current state before the dispatch was fired
  - `action` is an object with a `type` and `payload` parameters. This is not
    enforced - as long as it matches your reducer then it should work. However,
    it is suggested to keep to this structure for consistency and best editor
    suggestions when dispatching actions.
  - Reducer doesn't need to return the full state, you can return a partial
    state which then get merged with the rest of the state.

### `withStore(RootComponent, ...stores)`

Returns the root component wrapped with context providers from your stores.

`RootComponent` - The root component that the stores will be available to.

`stores` - The rest of the arguments are the stores that you want to make
available, useful when you want to modularise your store.

### `Store.connect(EnhancedComponent, getState)`

`EnhancedComponent` - This is a functional component that takes as a second
argument an array of states, and as a third argument the dispatch function.

- `(props, states, dispatch) => Element`

`getState` - This is a getter function that takes the state and returns an array
of states. The resulting array is used to memoize the component.

- `state => any[]`
