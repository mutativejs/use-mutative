import { Dispatch, useCallback, useReducer } from 'react';

import { create } from 'mutative';

export type MutativeReducer<R, I> = (draftState: R, action: I) => void | R;

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
export function useMutativeReducer<R, I, K = (arg: R) => R>(
  reducer: MutativeReducer<R, I>,
  initialState: R,
  initializer?: K
): [R, Dispatch<I>] {
  const mutativeReducer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any, action: any) => {
      let replaceResult: unknown = void 0;

      const newState = create(state, (draft) => {
        const result = reducer(draft, action);

        if (
          result &&
          // when be same object, not be replace
          draft !== result
        ) {
          replaceResult = result;
        }
      });

      return replaceResult ?? newState;
    },
    [reducer]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useReducer(mutativeReducer, initialState, initializer as any);
}
