import type { Dispatch } from 'react';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { Options, Patch } from 'mutative';
import { create } from 'mutative';

export type MutativeReducer<R, I> = (draftState: R, action: I) => void | R;

export const MUTATIVE_ROOT_OVERRIDE = Symbol('MUTATIVE_ROOT_OVERRIDE');

export type PatchState<T> =
  | {
      actions: T[] | typeof MUTATIVE_ROOT_OVERRIDE;
      patches: [Patch[], Patch[]];
    }
  | undefined;
/**
 * provide you can create immutable state easily with mutable way in reducer.
 *
 * @example
 * ```tsx
 *
 * function reducer(
 *   draft: State,
 *   action: { type: 'reset' | 'increment' | 'decrement' }
 * ) {
 *   switch (action.type) {
 *     case 'reset':
 *       return initialState;
 *     case 'increment':
 *       return void draft.count++;
 *     case 'decrement':
 *       return void draft.count--;
 *   }
 * }
 *
 * export function App() {
 *   const [state, dispatch] = useMutativeReducer(reducer, initialState);
 *
 *   return (
 *     <div>
 *       Count: {state.count}
 *       <br />
 *       <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
 *       <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
 *       <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMutativeReducer<
  /**
   * initial state
   */
  R,
  /**
   * action type
   */
  I,
  O extends boolean = false,
  F extends boolean = false
>(
  reducer: MutativeReducer<R, I>,
  initialState: R,
  initializer?: (arg: R) => R,
  options?: Options<O, F>
): O extends true ? [R, Dispatch<I>, PatchState<I>] : [R, Dispatch<I>] {
  const optionsRef = useRef(options);
  const enablePatchesRef = useRef(options?.enablePatches);

  const finalStateRef = useRef<unknown>();
  const actionsRef = useRef<I[]>([]);
  const countRef = useRef(0);

  const patchesRef = useRef<PatchState<I>>(undefined);

  if (
    process.env.NODE_ENV !== 'production' &&
    options?.enablePatches !== enablePatchesRef.current
  ) {
    console.warn(
      '[useMutative] should not change enablePatches after first mounted'
    );
  }

  const mutativeReducer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any, action: any) => {
      countRef.current++;
      const actions = actionsRef.current;

      const finalState = finalStateRef.current;

      if (finalState) {
        countRef.current = 0;
        actionsRef.current.length = 0;
        finalStateRef.current = undefined;
        return finalState;
      }

      // when that reduce be the length of action, execute all actions once
      if (countRef.current === actions.length) {
        const options = optionsRef.current;
        const enablePatches = enablePatchesRef.current;
        const actions = actionsRef.current;

        let replaceResult: unknown = void 0;

        const newState = create(
          state,
          (draft) => {
            actions.forEach((ac) => {
              const result = reducer(replaceResult ?? draft, ac);

              if (
                result &&
                // when not be same object, mean that need replace all
                draft !== result &&
                // also not be replace object
                replaceResult !== result
              ) {
                // TODO: do a clone when draft
                replaceResult = { ...result };
              }
            });

            countRef.current = 0;
          },
          options
        );

        if (enablePatches) {
          patchesRef.current = replaceResult
            ? {
                actions: MUTATIVE_ROOT_OVERRIDE,
                // TODO: should get the patch from source object
                patches: [[], []],
              }
            : {
                actions: [...actions],
                patches: newState.slice(1),
              };

          const toState = replaceResult ?? newState[0];

          finalStateRef.current = toState;
          return toState;
        }

        const toState = replaceResult ?? newState;
        finalStateRef.current = toState;

        return toState;
      }
      return state;
    },
    [reducer]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, sourceReducer] = useReducer(
    mutativeReducer,
    initialState,
    initializer as never
  );

  useEffect(() => {
    countRef.current = 0;
    actionsRef.current.length = 0;
    finalStateRef.current = undefined;
    patchesRef.current = undefined;
  });

  const current = patchesRef.current;
  return (
    enablePatchesRef.current
      ? [
          state,
          (action: I) => {
            actionsRef.current.push(action);
            sourceReducer(action);
          },
          current,
        ]
      : [
          state,
          (action: I) => {
            actionsRef.current.push(action);
            sourceReducer(action);
          },
        ]
  ) as never;
}
