import React from "react";
import { createStore, withStores } from "./index";
import { render, cleanup, fireEvent } from "@testing-library/react";

const initialState = { count: 0, message: "Hi" };
const reducer = (
  state: typeof initialState,
  action: import("./index").Action
) => {
  switch (action.type) {
    case "increase":
      return { count: state.count + 1 };
    case "setMessage":
      return { message: action.payload };
  }
};

describe("react-lit-store", () => {
  let store: import("./index").Store<typeof initialState>;

  function renderStore(Component: React.ReactElement) {
    return render(<store.Provider>{Component}</store.Provider>);
  }

  beforeEach(() => {
    store = createStore(initialState, reducer);
  });

  afterEach(cleanup);

  describe("createStore", () => {
    it("store contains Provider and a connect method", () => {
      expect(store).toHaveProperty("Provider");
      expect(store).toHaveProperty("connect");
    });
  });

  describe("Provider", () => {
    it("renders children", () => {
      const { asFragment } = render(
        <store.Provider>
          <div>test</div>
        </store.Provider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("connect", () => {
    it("connect without Provider", () => {
      const Component = store.connect(
        (_props, [state], dispatch) => {
          // dispatching without a provider shouldn't error
          dispatch({ type: "test" });
          return <div>{JSON.stringify(state)}</div>;
        },
        state => [state]
      );
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("makes the state available", () => {
      const ConnectedComponent = store.connect(
        (_props, [state]) => <div>{JSON.stringify(state)}</div>,
        state => [state]
      );
      const { asFragment } = renderStore(<ConnectedComponent />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("can select a subset of the state", () => {
      const ConnectedComponent = store.connect(
        (_props, [message]) => <div>{message}</div>,
        state => [state.message]
      );
      const { asFragment } = renderStore(<ConnectedComponent />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("dispatch actions to update the state", () => {
      const ConnectedComponent = store.connect(
        (_props, [count], dispatch) => (
          <button
            data-testid="button"
            onClick={() => dispatch({ type: "increase" })}
          >
            {count}
          </button>
        ),
        state => [state.count]
      );
      const { getByTestId, asFragment } = renderStore(<ConnectedComponent />);
      const button = getByTestId("button");

      expect(button.innerHTML).toEqual("0");
      fireEvent.click(button);
      expect(button.innerHTML).toEqual("1");
      expect(asFragment()).toMatchSnapshot();
    });

    it("optimises render", () => {
      const countRendered = jest.fn();
      const messageRendered = jest.fn();

      const Count = store.connect(
        (_props, [count]) => {
          countRendered();
          return <div>{count}</div>;
        },
        state => [state.count]
      );
      const Message = store.connect(
        (_props, [message], dispatch) => {
          messageRendered();
          const handleClick = () =>
            dispatch({ type: "setMessage", payload: "test" });
          return (
            <button data-testid="button" onClick={handleClick}>
              {message}
            </button>
          );
        },
        state => [state.message]
      );
      const { getByTestId } = renderStore(
        <>
          <Count />
          <Message />
        </>
      );
      const button = getByTestId("button");

      expect(countRendered).toHaveBeenCalledTimes(1);
      expect(messageRendered).toHaveBeenCalledTimes(1);
      fireEvent.click(button);
      expect(countRendered).toHaveBeenCalledTimes(1);
      expect(messageRendered).toHaveBeenCalledTimes(2);
    });
  });

  describe("withStore", () => {
    it("provides multiple stores", () => {
      const storeA = createStore({ count: 0 }, (_s, _a) => _s);
      const storeB = createStore({ message: "hello" }, (_s, _a) => _s);

      const ComponentA = storeA.connect(
        (_props, [count]) => <div>{count}</div>,
        state => [state.count]
      );
      const ComponentB = storeB.connect(
        (_props, [message]) => <div>{message}</div>,
        state => [state.message]
      );

      const App = withStores(
        props => (
          <div>
            {props.test}
            <ComponentA />
            <ComponentB />
          </div>
        ),
        storeA,
        storeB
      );

      const { asFragment } = render(<App test="test" />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
