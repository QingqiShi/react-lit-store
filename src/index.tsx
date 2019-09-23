import React, { createContext, useContext, useReducer, useMemo } from "react";

export type Mutations<S> = {
  [name: string]: (state: S, ...args: any) => Partial<S>;
};

export type Payload<M> = M extends (state: any, ...args: infer P) => any
  ? P
  : never;

export type Actions<M> = {
  [name in keyof M]: (...args: Payload<M[name]>) => void;
};

export type StoreContext<S, A> = React.Context<[S, A]>;

export type Store<S, M> = {
  Provider: React.FC<React.PropsWithChildren<{}>>;
  useStore: () => [Readonly<S>, Actions<M>];
};

function getEmptyActions<S, M extends Mutations<S>>(mutations: M) {
  const actions: Actions<M> = Object.assign({}, mutations);
  Object.keys(mutations).forEach((name: keyof M) => {
    actions[name] = () => {};
  });
  return actions;
}

/**
 * Create a lit-store instance with the initial state and reducer.
 * @param initialState Initial store state
 * @param reducer Reducer to mutate state
 * @returns Store instance with `Provider` component and `useStore` hook.
 */
export function createStore<S, M extends Mutations<S>>(
  initialState: S,
  mutations: M
): Store<S, M> {
  const context: StoreContext<S, Actions<M>> = createContext([
    initialState,
    getEmptyActions<S, M>(mutations)
  ]);

  function reducer(
    prevState: S,
    action: {
      type: keyof M;
      payload: Payload<M[keyof M]>;
    }
  ): S {
    return {
      ...prevState,
      ...mutations[action.type](prevState, ...action.payload)
    };
  }

  function Provider({ children }: React.PropsWithChildren<{}>) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const actions: Actions<M> = useMemo(() => {
      const result: Actions<M> = Object.assign({}, mutations);
      Object.keys(mutations).forEach((name: keyof M) => {
        result[name] = (...args) => {
          dispatch({ type: name, payload: args });
        };
      });
      return result;
    }, [dispatch]);

    return (
      <context.Provider value={[state, actions]}>{children}</context.Provider>
    );
  }

  function useStore() {
    return useContext(context);
  }

  return { Provider, useStore };
}

/**
 * A custom hook to combine multiple stores and returns a single Provider.
 * @param stores List of stores
 * @returns A single Provider component that provides all the stores
 */
export function useStoreProvider(
  ...stores: Store<any, any>[]
): React.FC<React.PropsWithChildren<{}>> {
  function Provider({ children }: React.PropsWithChildren<{}>) {
    let wrapped = children;
    stores.forEach(({ Provider }) => {
      wrapped = <Provider>{wrapped}</Provider>;
    });
    return <>{wrapped}</>;
  }

  return Provider;
}
