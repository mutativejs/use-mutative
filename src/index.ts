import {
  create,
  type Immutable,
  type Patches,
  type Options,
  type Draft,
} from 'mutative';
import {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  Dispatch,
} from 'react';

type PatchesOptions =
  | boolean
  | {
      /**
       * The default value is `true`. If it's `true`, the path will be an array, otherwise it is a string.
       */
      pathAsArray?: boolean;
      /**
       * The default value is `true`. If it's `true`, the array length will be included in the patches, otherwise no include array length.
       */
      arrayLengthAssignment?: boolean;
    };

type DraftFunction<S> = (draft: Draft<S>) => void;
type Updater<S> = (value: S | (() => S) | DraftFunction<S>) => void;

type InitialValue<I extends any> = I extends (...args: any) => infer R ? R : I;

type Result<S, O extends PatchesOptions, F extends boolean> = O extends
  | true
  | object
  ? [F extends true ? Immutable<S> : S, Updater<S>, Patches<O>, Patches<O>]
  : F extends true
  ? [Immutable<S>, Updater<S>]
  : [S, Updater<S>];

/**
 * `useMutative` is a hook that is similar to `useState` but it uses `mutative` to handle the state updates.
 */
function useMutative<
  S,
  F extends boolean = false,
  O extends PatchesOptions = false
>(
  /**
   * The initial state. You may optionally provide an initializer function to calculate the initial state.
   */
  initialValue: S,
  /**
   * Options for the `useMutative` hook.
   */
  options?: Options<O, F>
) {
  const [state, setState] = useState(() => {
    const initialState =
      typeof initialValue === 'function' ? initialValue() : initialValue;
    return options?.enablePatches ? [initialState, [], []] : initialState;
  });
  const updateState = useCallback((updater: any) => {
    const currentState = options?.enablePatches ? state[0] : state;
    if (typeof updater === 'function') {
      setState(create(currentState, updater, options));
    } else {
      setState(create(currentState, () => updater, options));
    }
  }, []);
  return (
    options?.enablePatches
      ? [state[0], updateState, state[1], state[2]]
      : [state, updateState]
  ) as Result<InitialValue<S>, O, F>;
}

type ReducerResult<
  S,
  A,
  O extends PatchesOptions,
  F extends boolean
> = O extends true | object
  ? [F extends true ? Immutable<S> : S, Dispatch<A>, Patches<O>, Patches<O>]
  : F extends true
  ? [Immutable<S>, Dispatch<A>]
  : [S, Dispatch<A>];

type Reducer<S, A> = (draftState: Draft<S>, action: A) => void | S | undefined;

function useMutativeReducer<
  S,
  A,
  I,
  F extends boolean = false,
  O extends PatchesOptions = false
>(
  reducer: Reducer<S, A>,
  initializerArg: S & I,
  initializer: (arg: S & I) => S,
  options?: Options<O, F>
): ReducerResult<S, A, O, F>;

function useMutativeReducer<
  S,
  A,
  I,
  F extends boolean = false,
  O extends PatchesOptions = false
>(
  reducer: Reducer<S, A>,
  initializerArg: I,
  initializer: (arg: I) => S,
  options?: Options<O, F>
): ReducerResult<S, A, O, F>;

function useMutativeReducer<
  S,
  A,
  F extends boolean = false,
  O extends PatchesOptions = false
>(
  reducer: Reducer<S, A>,
  initialState: S,
  initializer?: undefined,
  options?: Options<O, F>
): ReducerResult<S, A, O, F>;

/**
 * `useMutativeReducer` is a hook that is similar to `useReducer` but it uses `mutative` to handle the state updates.
 */
function useMutativeReducer<
  S,
  A,
  I,
  F extends boolean = false,
  O extends PatchesOptions = false
>(
  /**
   * A function that returns the next state tree, given the current state tree and the action to handle.
   */
  reducer: Reducer<S, A>,
  /**
   * The initial state. You may optionally provide an initializer function to calculate the initial state.
   */
  initializerArg: S & I,
  /**
   * An initializer function that returns the initial state. It will be called with `initializerArg`.
   */
  initializer?: (arg: S & I) => S,
  /**
   * Options for the `useMutativeReducer` hook.
   */
  options?: Options<O, F>
): ReducerResult<S, A, O, F> {
  const ref = useRef<[Patches, Patches]>([[], []]);
  const cachedReducer: any = useMemo(
    () => (state: any, action: any) => {
      const result: any = create(
        state,
        (draft) => reducer(draft, action),
        options
      );
      if (options?.enablePatches) {
        ref.current = [result[1], result[2]];
        return result[0];
      }
      return result;
    },
    [reducer]
  );
  const result: any = useReducer(
    cachedReducer,
    initializerArg as any,
    initializer as any
  );
  return options?.enablePatches
    ? [result[0], result[1], ref.current[0], ref.current[1]]
    : result;
}

export {
  type DraftFunction,
  type Updater,
  type Reducer,
  useMutative,
  useMutativeReducer,
};
