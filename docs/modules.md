[**use-mutative**](README.md)

***

# use-mutative

## Type Aliases

### DraftFunction

> **DraftFunction**\<`S`\> = (`draft`) => `void`

Defined in: [index.ts:20](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L20)

#### Type Parameters

##### S

`S`

#### Parameters

##### draft

`Draft`\<`S`\>

#### Returns

`void`

***

### InitialValue

> **InitialValue**\<`I`\> = `I` *extends* (...`args`) => infer R ? `R` : `I`

Defined in: [index.ts:23](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L23)

#### Type Parameters

##### I

`I` *extends* `any`

***

### Reducer

> **Reducer**\<`S`, `A`\> = (`draftState`, `action`) => `void` \| `S` \| `undefined`

Defined in: [index.ts:149](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L149)

#### Type Parameters

##### S

`S`

##### A

`A`

#### Parameters

##### draftState

`Draft`\<`S`\>

##### action

`A`

#### Returns

`void` \| `S` \| `undefined`

***

### ReducerResult

> **ReducerResult**\<`S`, `A`, `O`, `F`\> = `O` *extends* `true` \| `object` ? \[`F` *extends* `true` ? `Immutable`\<`S`\> : `S`, `Dispatch`\<`A`\>, `Patches`\<`O`\>, `Patches`\<`O`\>\] : `F` *extends* `true` ? \[`Immutable`\<`S`\>, `Dispatch`\<`A`\>\] : \[`S`, `Dispatch`\<`A`\>\]

Defined in: [index.ts:138](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L138)

#### Type Parameters

##### S

`S`

##### A

`A`

##### O

`O` *extends* `PatchesOptions`

##### F

`F` *extends* `boolean`

***

### Result

> **Result**\<`S`, `O`, `F`\> = `O` *extends* `true` \| `object` ? \[`F` *extends* `true` ? `Immutable`\<`S`\> : `S`, [`Updater`](#updater)\<`S`\>, `Patches`\<`O`\>, `Patches`\<`O`\>\] : `F` *extends* `true` ? \[`Immutable`\<`S`\>, [`Updater`](#updater)\<`S`\>\] : \[`S`, [`Updater`](#updater)\<`S`\>\]

Defined in: [index.ts:25](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L25)

#### Type Parameters

##### S

`S`

##### O

`O` *extends* `PatchesOptions`

##### F

`F` *extends* `boolean`

***

### Updater

> **Updater**\<`S`\> = (`value`) => `void`

Defined in: [index.ts:21](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L21)

#### Type Parameters

##### S

`S`

#### Parameters

##### value

`S` \| (() => `S`) \| [`DraftFunction`](#draftfunction)\<`S`\>

#### Returns

`void`

## Functions

### useMutative()

> **useMutative**\<`S`, `F`, `O`\>(`initialValue`, `options?`): [`Result`](#result)\<[`InitialValue`](#initialvalue)\<`S`\>, `O`, `F`\>

Defined in: [index.ts:54](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L54)

`useMutative` is a hook that is similar to `useState` but it uses `mutative` to handle the state updates.

#### Type Parameters

##### S

`S`

##### F

`F` *extends* `boolean` = `false`

##### O

`O` *extends* `PatchesOptions` = `false`

#### Parameters

##### initialValue

`S`

The initial state. You may optionally provide an initializer function to calculate the initial state.

##### options?

`ExternalOptions`\<`O`, `F`\>

Options for the `useMutative` hook.

#### Returns

[`Result`](#result)\<[`InitialValue`](#initialvalue)\<`S`\>, `O`, `F`\>

#### Example

```ts
import { act, renderHook } from '@testing-library/react';

import { useMutative } from '../src/index';

const { result } = renderHook(() => useMutative({ items: [1] }));
const [state, updateState] = result.current;
act(() =>
  updateState((draft) => {
    draft.items.push(2);
  })
);
const [nextState] = result.current;
expect(nextState).toEqual({ items: [1, 2] });
```

***

### useMutativeReducer()

`useMutativeReducer` is a hook that is similar to `useReducer` but it uses `mutative` to handle the state updates.

#### Example

```ts
import { act, renderHook } from '@testing-library/react';
import { type Draft } from 'mutative';

import { useMutativeReducer } from '../src/index';

const { result } = renderHook(() =>
  useMutativeReducer(
    (
      draft: Draft<Readonly<{ count: number }>>,
      action: {
        type: 'increment';
      }
    ) => {
      switch (action.type) {
        case 'increment':
          draft.count += 1;
      }
    },
    { count: 0 }
  )
);
const [, dispatch] = result.current;
act(() => dispatch({ type: 'increment' }));
expect(result.current[0]).toEqual({ count: 1 });
```

#### Call Signature

> **useMutativeReducer**\<`S`, `A`, `I`, `F`, `O`\>(`reducer`, `initializerArg`, `initializer`, `options?`): [`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>

Defined in: [index.ts:151](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L151)

##### Type Parameters

###### S

`S`

###### A

`A`

###### I

`I`

###### F

`F` *extends* `boolean` = `false`

###### O

`O` *extends* `PatchesOptions` = `false`

##### Parameters

###### reducer

[`Reducer`](#reducer)\<`S`, `A`\>

###### initializerArg

`S` & `I`

###### initializer

(`arg`) => `S`

###### options?

`ExternalOptions`\<`O`, `F`\>

##### Returns

[`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>

#### Call Signature

> **useMutativeReducer**\<`S`, `A`, `I`, `F`, `O`\>(`reducer`, `initializerArg`, `initializer`, `options?`): [`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>

Defined in: [index.ts:164](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L164)

##### Type Parameters

###### S

`S`

###### A

`A`

###### I

`I`

###### F

`F` *extends* `boolean` = `false`

###### O

`O` *extends* `PatchesOptions` = `false`

##### Parameters

###### reducer

[`Reducer`](#reducer)\<`S`, `A`\>

###### initializerArg

`I`

###### initializer

(`arg`) => `S`

###### options?

`ExternalOptions`\<`O`, `F`\>

##### Returns

[`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>

#### Call Signature

> **useMutativeReducer**\<`S`, `A`, `F`, `O`\>(`reducer`, `initialState`, `initializer?`, `options?`): [`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>

Defined in: [index.ts:177](https://github.com/mutativejs/use-mutative/blob/0bcb2fc4b1d3fd16f337538133c580699133af39/src/index.ts#L177)

##### Type Parameters

###### S

`S`

###### A

`A`

###### F

`F` *extends* `boolean` = `false`

###### O

`O` *extends* `PatchesOptions` = `false`

##### Parameters

###### reducer

[`Reducer`](#reducer)\<`S`, `A`\>

###### initialState

`S`

###### initializer?

`undefined`

###### options?

`ExternalOptions`\<`O`, `F`\>

##### Returns

[`ReducerResult`](#reducerresult)\<`S`, `A`, `O`, `F`\>
