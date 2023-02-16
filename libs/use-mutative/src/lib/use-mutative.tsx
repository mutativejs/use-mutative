import type { Dispatch } from 'react';
import { useCallback } from 'react';

import type { Options, Patch } from 'mutative';

import type { DraftedObject } from './use-mutative-reducer';
import { useMutativeReducer } from './use-mutative-reducer';

export type MutativeDispatch<T> = (draft: DraftedObject<T>) => void | T;

function reducer<S extends object>(draft: S, action: S | Dispatch<S>) {
  if (typeof action === 'function') {
    return action(draft);
  }

  return action;
}

/**
 * provide you can create immutable state easily with mutable way.
 *
 * @example
 *
 * ```tsx
 * export function App() {
 *   const [state, setState] = useMutative(
 *     {
 *       foo: 'bar',
 *       list: [
 *         { text: 'todo' },
 *       ],
 *     },
 *   );
 *
 *   <button
 *     onClick={() => {
 *       // set value with draft mutable
 *       setState((draft) => {
 *         draft.foo = `${draft.foo} 2`;
 *         draft.list.push({ text: 'todo 2' });
 *       });
 *     }}
 *   >
 *     click
 *   </button>
 *   <button
 *     onClick={() => {
 *       // also can override value directly
 *       setState({
 *         foo: 'bar 2',
 *         list: [{ text: 'todo 2' }],
 *       });
 *     }}
 *   >
 *     click
 *   </button>
 * }
 * ```
 */
export function useMutative<
  S extends object | (() => object),
  O extends boolean = false,
  F extends boolean = false,
  K = S extends () => unknown ? ReturnType<S> : S
>(
  initialValue: S,
  options?: Options<O, F>
): O extends true
  ? [K, (draft: K | MutativeDispatch<K>) => void, Patch[], Patch[]]
  : [K, (draft: K | MutativeDispatch<K>) => void] {
  const initIsFn = typeof initialValue === 'function';

  const [state, dispatch, patchesState] = useMutativeReducer(
    reducer as never,
    initialValue,
    (initIsFn ? initialValue : undefined) as never,
    options
  );

  return [
    state,
    useCallback((updater: unknown) => {
      dispatch(updater);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
    ...(options?.enablePatches
      ? patchesState?.patches || [undefined, undefined]
      : []),
  ] as never;
}
