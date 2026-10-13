**use-mutative**

***

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

`use-mutative` 2.x requires `mutative` 2.x. If your app still depends on `mutative` 1.x, use `use-mutative` 1.x, or upgrade with the [migration guide from Mutative v1 to v2](https://mutative.js.org/docs/advanced-guides/migration-v2).

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

> A reducer changes the draft and returns nothing, or returns a new state. Wrap a returned value that holds no drafts in [`rawReturn()`](https://mutative.js.org/docs/api-reference/rawreturn), so that Mutative skips searching it for drafts and development builds don't warn about it. Never wrap a value that holds drafts.

```tsx
import { rawReturn, type Draft } from 'mutative';
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

Since Mutative v2 (see the [migration guide](https://mutative.js.org/docs/advanced-guides/migration-v2#patches)):

- The patches of a nested draft come before those of its parents, as in Immer. Applying them gives the same state as before, but tests that pin the patches of Mutative v1 may need new snapshots.
- A patch value can be the same object that the next state holds, and with `enableAutoFreeze` it is frozen with the state. Copy a patch value before you change it.
- A new state that replaces the current one, whether passed to the setter of `useMutative()` or returned from a recipe or a reducer, yields a `replace` patch of the root path `[]`. `apply()` with `mutable: true` throws for such a patch, since it cannot replace the state in place.

## License

`use-mutative` is [MIT licensed](https://github.com/mutativejs/use-mutative/blob/main/LICENSE).
