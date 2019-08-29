import React, { useEffect } from "react";
import { render, fireEvent } from "@testing-library/react";
import { createStore, useStoreProvider, Store } from "./index";
import "@testing-library/jest-dom/extend-expect";

function renderWithStore(ui: React.ReactNode, store: Store<any, any>) {
  return render(<store.Provider>{ui}</store.Provider>);
}

describe("libs/lit-store", () => {
  describe("createStore", () => {
    it("returns Provider and useStore", () => {
      const store = createStore({ counter: 0 }, {});
      expect(store).toHaveProperty("Provider");
      expect(store).toHaveProperty("useStore");
    });
  });

  describe("Provider", () => {
    it("renders children", () => {
      const store = createStore({ counter: 0 }, {});
      const { container } = renderWithStore(<div>test</div>, store);
      expect(container.firstChild).toContainHTML("<div>test</div>");
    });
  });

  describe("useStore", () => {
    it("returns state", () => {
      const store = createStore({ message: "Hi" }, {});
      const Component = () => {
        const [state] = store.useStore();
        return <div>{state.message}</div>;
      };

      const { container } = renderWithStore(<Component />, store);
      expect(container.firstChild).toContainHTML("<div>Hi</div>");
    });

    it("returns actions", () => {
      const store = createStore(
        { count: 0 },
        { increment: state => ({ count: state.count + 1 }) }
      );
      const Component = () => {
        const [state, actions] = store.useStore();
        return (
          <button onClick={() => actions.increment()}>{state.count}</button>
        );
      };

      const { getByText } = renderWithStore(<Component />, store);
      const button = getByText("0");
      fireEvent.click(button);

      expect(button).toContainHTML("1");
    });

    it("returns initial state without Provider", () => {
      const store = createStore({ message: "Hi" }, {});
      const Component = () => {
        const [state] = store.useStore();
        return <div>{state.message}</div>;
      };
      const { container } = render(<Component />);
      expect(container.firstChild).toContainHTML("<div>Hi</div>");
    });

    it("returns empty actions without Provider", () => {
      const mockAction = jest.fn();
      const store = createStore({}, { testAction: mockAction });
      const Component = () => {
        const [, actions] = store.useStore();
        return <button onClick={() => actions.testAction()}>action</button>;
      };

      const { getByText } = render(<Component />);
      fireEvent.click(getByText("action"));

      // Empty actions should not do anything
      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("useStoreProvider", () => {
    it("provides multiple stores", () => {
      const storeA = createStore(
        { count: 0 },
        { increment: () => ({ count: 1 }) }
      );
      const storeB = createStore(
        { message: "hello" },
        { update: () => ({ message: "test" }) }
      );

      const ComponentA = () => {
        const [{ count }, { increment }] = storeA.useStore();
        useEffect(() => {
          increment();
        }, [increment]);
        return <div>{count}</div>;
      };
      const ComponentB = () => {
        const [{ message }, { update }] = storeB.useStore();
        useEffect(() => {
          update();
        }, [update]);
        return <div>{message}</div>;
      };

      const App = () => {
        const Provider = useStoreProvider(storeA, storeB);
        return (
          <Provider>
            <div>
              <ComponentA />
              <ComponentB />
            </div>
          </Provider>
        );
      };

      const { container } = render(<App />);
      expect(container.firstChild).toContainHTML("<div>1</div>");
      expect(container.firstChild).toContainHTML("<div>test</div>");
    });
  });
});
