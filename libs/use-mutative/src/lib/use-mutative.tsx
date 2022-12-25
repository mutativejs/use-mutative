import { Dispatch, useCallback, useRef, useState } from 'react';

import type { Patch } from 'mutative';
import { create } from 'mutative';

export type MutativeHook<S, E extends boolean> = [
  S,
  (draft: S | Dispatch<S>) => E extends true ? [Patch[], Patch[]] : void
];

const emptyFn = () => {
  //
};

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
  E extends boolean = false
>(
  initialValue: S,
  options?: { enablePatches?: E }
): MutativeHook<S extends () => unknown ? ReturnType<S> : S, E> {
  const optionsRef = useRef(options);
  const enablePatchesRef = useRef(options?.enablePatches);

  if (
    process.env.NODE_ENV !== 'production' &&
    options?.enablePatches !== enablePatchesRef.current
  ) {
    console.warn(
      '[useMutative] should not change enablePatches after first mounted'
    );
  }

  const [val, updateValue] = useState(() => {
    const result = create(
      typeof initialValue === 'function' ? initialValue() : initialValue,
      emptyFn,
      options
    );

    return enablePatchesRef.current ? result[0] : result;
  });

  const valRef = useRef(val);
  console.log('🚀 ~ val', val);
  valRef.current = val;

  return [
    val,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useCallback((updater: any) => {
      const isFn = typeof updater === 'function';
      const enablePatches = enablePatchesRef.current;
      const options = optionsRef.current;

      const result = isFn
        ? create(
            valRef.current,
            (...args) => {
              updater(...args);
            },
            options
          )
        : create(updater, emptyFn, options);

      if (enablePatches) {
        updateValue(result[0]);

        return result.slice(1);
      }

      updateValue(result);
    }, []),
  ];
}
