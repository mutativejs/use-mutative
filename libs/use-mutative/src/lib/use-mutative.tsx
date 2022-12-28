import { Dispatch, useCallback } from 'react';

import type { Patch } from 'mutative';
// TODO: fix type in mutative
import type { Options } from 'mutative/dist/interface';

import { useMutativeReducer } from './use-mutative-reducer';

function reducer<S extends object>(draft: S, action: S | Dispatch<S>) {
  if (typeof action === 'function') {
    action(draft);
    return;
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
  F extends boolean = false
>(
  initialValue: S,
  options?: Options<O, F>
): O extends true
  ? [S, (draft: S | Dispatch<S>) => void, Patch[], Patch[]]
  : [S, (draft: S | Dispatch<S>) => void] {
  const initIsFn = typeof initialValue === 'function';

  const [state, dispatch, patchesState] = useMutativeReducer(
    reducer as any,
    initialValue,
    (initIsFn ? initialValue : undefined) as any,
    options
  );

  return [
    state,
    useCallback((updater: unknown) => {
      dispatch(updater);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
    ...(patchesState?.patches || []),
  ] as never;
}
