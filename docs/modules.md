[use-mutative](README.md) / Exports

# use-mutative

## Table of contents

### Type Aliases

- [DraftFunction](modules.md#draftfunction)
- [Reducer](modules.md#reducer)
- [Updater](modules.md#updater)

### Functions

- [useMutative](modules.md#usemutative)
- [useMutativeReducer](modules.md#usemutativereducer)

## Type Aliases

### DraftFunction

Ƭ **DraftFunction**\<`S`\>: (`draft`: `Draft`\<`S`\>) => `void`

#### Type parameters

| Name |
| :------ |
| `S` |

#### Type declaration

▸ (`draft`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `draft` | `Draft`\<`S`\> |

##### Returns

`void`

#### Defined in

[index.ts:30](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L30)

___

### Reducer

Ƭ **Reducer**\<`S`, `A`\>: (`draftState`: `Draft`\<`S`\>, `action`: `A`) => `void` \| `S` \| `undefined`

#### Type parameters

| Name |
| :------ |
| `S` |
| `A` |

#### Type declaration

▸ (`draftState`, `action`): `void` \| `S` \| `undefined`

##### Parameters

| Name | Type |
| :------ | :------ |
| `draftState` | `Draft`\<`S`\> |
| `action` | `A` |

##### Returns

`void` \| `S` \| `undefined`

#### Defined in

[index.ts:109](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L109)

___

### Updater

Ƭ **Updater**\<`S`\>: (`value`: `S` \| () => `S` \| [`DraftFunction`](modules.md#draftfunction)\<`S`\>) => `void`

#### Type parameters

| Name |
| :------ |
| `S` |

#### Type declaration

▸ (`value`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `S` \| () => `S` \| [`DraftFunction`](modules.md#draftfunction)\<`S`\> |

##### Returns

`void`

#### Defined in

[index.ts:31](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L31)

## Functions

### useMutative

▸ **useMutative**\<`S`, `F`, `O`\>(`initialValue`, `options?`): `Result`\<`InitialValue`\<`S`\>, `O`, `F`\>

`useMutative` is a hook that is similar to `useState` but it uses `mutative` to handle the state updates.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `F` | extends `boolean` = ``false`` |
| `O` | extends `PatchesOptions` = ``false`` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialValue` | `S` | The initial state. You may optionally provide an initializer function to calculate the initial state. |
| `options?` | `ExternalOptions`\<`O`, `F`\> | Options for the `useMutative` hook. |

#### Returns

`Result`\<`InitialValue`\<`S`\>, `O`, `F`\>

**`Example`**

```ts
import { act, renderHook } from '@testing-library/react';

import { useMutative } from '../src/index';

const { result } = renderHook(() => useMutative({ items: [1] }));
const [state, setState] = result.current;
act(() =>
  setState((draft) => {
    draft.items.push(2);
  })
);
const [nextState] = result.current;
expect(nextState).toEqual({ items: [1, 2] });
```

#### Defined in

[index.ts:64](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L64)

___

### useMutativeReducer

▸ **useMutativeReducer**\<`S`, `A`, `I`, `F`, `O`\>(`reducer`, `initializerArg`, `initializer`, `options?`): `ReducerResult`\<`S`, `A`, `O`, `F`\>

`useMutativeReducer` is a hook that is similar to `useReducer` but it uses `mutative` to handle the state updates.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `A` | `A` |
| `I` | `I` |
| `F` | extends `boolean` = ``false`` |
| `O` | extends `PatchesOptions` = ``false`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `reducer` | [`Reducer`](modules.md#reducer)\<`S`, `A`\> |
| `initializerArg` | `S` & `I` |
| `initializer` | (`arg`: `S` & `I`) => `S` |
| `options?` | `ExternalOptions`\<`O`, `F`\> |

#### Returns

`ReducerResult`\<`S`, `A`, `O`, `F`\>

**`Example`**

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

#### Defined in

[index.ts:111](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L111)

▸ **useMutativeReducer**\<`S`, `A`, `I`, `F`, `O`\>(`reducer`, `initializerArg`, `initializer`, `options?`): `ReducerResult`\<`S`, `A`, `O`, `F`\>

`useMutativeReducer` is a hook that is similar to `useReducer` but it uses `mutative` to handle the state updates.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `A` | `A` |
| `I` | `I` |
| `F` | extends `boolean` = ``false`` |
| `O` | extends `PatchesOptions` = ``false`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `reducer` | [`Reducer`](modules.md#reducer)\<`S`, `A`\> |
| `initializerArg` | `I` |
| `initializer` | (`arg`: `I`) => `S` |
| `options?` | `ExternalOptions`\<`O`, `F`\> |

#### Returns

`ReducerResult`\<`S`, `A`, `O`, `F`\>

**`Example`**

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

#### Defined in

[index.ts:124](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L124)

▸ **useMutativeReducer**\<`S`, `A`, `F`, `O`\>(`reducer`, `initialState`, `initializer?`, `options?`): `ReducerResult`\<`S`, `A`, `O`, `F`\>

`useMutativeReducer` is a hook that is similar to `useReducer` but it uses `mutative` to handle the state updates.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `A` | `A` |
| `F` | extends `boolean` = ``false`` |
| `O` | extends `PatchesOptions` = ``false`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `reducer` | [`Reducer`](modules.md#reducer)\<`S`, `A`\> |
| `initialState` | `S` |
| `initializer?` | `undefined` |
| `options?` | `ExternalOptions`\<`O`, `F`\> |

#### Returns

`ReducerResult`\<`S`, `A`, `O`, `F`\>

**`Example`**

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

#### Defined in

[index.ts:137](https://github.com/unadlib/use-mutative/blob/b9643e5/src/index.ts#L137)
