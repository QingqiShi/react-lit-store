import React, { createContext, useContext, useReducer, useMemo } from "react";

type StoreContext<S> = React.Context<[S, React.Dispatch<Action>]>;

type PartialReducer<S> = (
  prevState: S,
  action: Action
) => Partial<S> | undefined;

type Connect<S, T = any[]> = (
  Component: (
    props: any,
    states: T,
    dispatch: React.Dispatch<Action>
  ) => React.ReactElement,
  getStates: (state: S) => T
) => (props: any) => React.ReactElement;

export interface Action {
  type: string;
  payload: any;
}

export interface Store<S> {
  Provider: (props: { children: React.ReactElement }) => React.ReactElement;
  connect: Connect<S>;
}

/**
 * Creates the a store.
 */
export function createStore<S>(
  initialState: S,
  reducer: PartialReducer<S>
): Store<S> {
  const context: StoreContext<S> = createContext([initialState, _ => {}]);

  const enhancedReducer = (prevState: S, action: Action) => ({
    ...prevState,
    ...reducer(prevState, action)
  });

  const Provider = ({ children }: { children: JSX.Element }) => {
    const store = useReducer<React.Reducer<S, Action>>(
      enhancedReducer,
      initialState
    );
    return <context.Provider value={store}>{children}</context.Provider>;
  };

  const connect = <T extends any[]>(
    Component: (
      props: any,
      states: T,
      dispatch: React.Dispatch<Action>
    ) => React.ReactElement,
    getStates: (state: S) => T
  ) => (props: any) => {
    const [state, dispatch] = useContext(context);
    const deps = getStates(state);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => Component(props, deps, dispatch), [...deps, props]);
  };

  return { Provider, connect };
}

/**
 * Helper function that combines multiple stores and wrapps the provided
 * component with the providers of each store.
 */
export function withStores(
  Component: React.JSXElementConstructor<{}>,
  ...stores: Store<any>[]
) {
  return (props: any) => {
    let wrapped = <Component {...props} />;

    stores.forEach(store => {
      wrapped = <store.Provider>{wrapped}</store.Provider>;
    });

    return wrapped;
  };
}
