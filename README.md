# use-mutative

![Node CI](https://github.com/mutativejs/use-mutative/workflows/Node%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/mutativejs/use-mutative/badge.svg?branch=main)](https://coveralls.io/github/mutativejs/use-mutative?branch=main)
[![npm](https://img.shields.io/npm/v/use-mutative.svg)](https://www.npmjs.com/package/use-mutative)
![license](https://img.shields.io/npm/l/use-mutative)

A hook to use [Mutative](https://github.com/unadlib/mutative) as a React hook to efficient update react state immutable with mutable way.

`use-mutative` is 2-6x faster than `useState()` with spread operation, more than 10x faster than `useImmer()`. [Read more about the performance comparison in Mutative](https://mutative.js.org/docs/getting-started/performance).

## Installation

Yarn

```bash
yarn add mutative use-mutative
```

NPM

```bash
npm install mutative use-mutative
```

## API

### useMutative()

Provide you can create immutable state easily with mutable way.

```tsx
import { useMutative } from 'use-mutative';

export function App() {
  const [todos, setTodos] = useMutative([{ text: 'todo' }]);
  return (
    <>
      <button
        onClick={() => {
          // set todos with draft mutable
          setTodos((draft) => {
            draft.push({ text: 'todo 2' });
          });
        }}
      >
        click
      </button>
      <button
        onClick={() => {
          // also can override value directly
          setTodos([{ text: 'todo' }, { text: 'todo 2' }]);
        }}
      >
        click
      </button>
    </>
  );
}
```

### useMutativeReducer()

Provide you can create immutable state easily with mutable way in reducer way.

> For return values that do not contain any drafts, you can use `rawReturn()` to wrap this return value to improve performance. It ensure that the return value is only returned explicitly.

```tsx
import { rawReturn } from 'mutative';
import { useMutativeReducer } from 'use-mutative';

const initialState = {
  count: 0,
};

function reducer(
  draft: Draft<typeof initialState>,
  action: { type: 'reset' | 'increment' | 'decrement' }
) {
  switch (action.type) {
    case 'reset':
      return rawReturn(initialState);
    case 'increment':
      return void draft.count++;
    case 'decrement':
      return void draft.count--;
  }
}

export function App() {
  const [state, dispatch] = useMutativeReducer(reducer, initialState);

  return (
    <div>
      Count: {state.count}
      <br />
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

More detail about `use-mutative` can be found in [API docs](https://github.com/mutativejs/use-mutative/blob/main/docs/modules.md)

### Patches

In some cases, you may want to get that patches from your update, we can pass `{ enablePatches: true }` options in `useMutative()` or `useMutativeReducer()`, that can provide you the ability to get that patches from pervious action.

```tsx
const [state, updateState, patches, inversePatches] = useMutative(initState, {
  enablePatches: true,
});

const [state, dispatch, patches, inversePatches] = useMutativeReducer(
  reducer,
  initState,
  initializer,
  { enablePatches: true }
);
```

patches format will follow https://jsonpatch.com/, but the `"path"` field be array structure.

## License

`use-mutative` is [MIT licensed](https://github.com/mutativejs/use-mutative/blob/main/LICENSE).
