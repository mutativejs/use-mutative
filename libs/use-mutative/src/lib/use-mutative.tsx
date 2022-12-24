import { create } from 'mutative';
import {
  useState,
  useReducer,
  useCallback,
  useMemo,
  Dispatch,
  useRef,
} from 'react';

export type MutativeHook<S, E extends boolean> = [
  S,
  (draft: S | Dispatch<S>) => E extends true ? any[] : void,
  any
];

const emptyFn = () => {
  //
};

export function useMutative<
  S extends object | (() => S) = any,
  E extends boolean = false
>(initialValue: S, options?: { enablePatches?: E }): MutativeHook<S, E> {
  const optionsRef = useRef(options);
  const enablePatchesRef = useRef(options?.enablePatches);
  const patchesRef = useRef();

  const [val, updateValue] = useState(() => {
    const result = (create as any)(
      typeof initialValue === 'function' ? initialValue() : initialValue,
      emptyFn,
      options
    ) as any;

    const enablePatches = enablePatchesRef.current;

    return enablePatches ? result[0] : result;
  });

  const valRef = useRef(val);

  return [
    val,
    useCallback((updater: any) => {
      const isFn = typeof updater === 'function';

      const result = (create as any)(
        isFn ? valRef.current : updater,
        isFn ? updater : emptyFn,
        optionsRef.current
      ) as any;

      const enablePatches = enablePatchesRef.current;
      const newState = enablePatches ? result[0] : result;

      if (enablePatches) {
        patchesRef.current = result[1];
      }

      valRef.current = newState;
      updateValue(newState);

      return enablePatches ? [...(result as []).slice(1)] : [];
    }, []) as any,
    patchesRef.current,
  ];
}

// // Provides different overloads of `useMutativeReducer` similar to `useReducer` from `@types/react`.

// export type MutativeReducer<S, A> = (
//   draftState: Draft<S>,
//   action: A
// ) => void | (S extends undefined ? typeof nothing : S);

// /**
//  * @deprecated Use `MutativeReducer` instead since there is already a `Reducer` type in `@types/react`.
//  */
// export type Reducer<S = any, A = any> = MutativeReducer<S, A>;

// export function useMutativeReducer<S, A, I>(
//   reducer: MutativeReducer<S, A>,
//   initializerArg: S & I,
//   initializer: (arg: S & I) => S
// ): [S, Dispatch<A>];

// export function useMutativeReducer<S, A, I>(
//   reducer: MutativeReducer<S, A>,
//   initializerArg: I,
//   initializer: (arg: I) => S
// ): [S, Dispatch<A>];

// export function useMutativeReducer<S, A>(
//   reducer: MutativeReducer<S, A>,
//   initialState: S,
//   initializer?: undefined
// ): [S, Dispatch<A>];

// export function useMutativeReducer<S, A, I>(
//   reducer: MutativeReducer<S, A>,
//   initializerArg: S & I,
//   initializer?: (arg: S & I) => S
// ) {
//   const cachedReducer = useMemo(() => produce(reducer), [reducer]);
//   return useReducer(cachedReducer, initializerArg as any, initializer as any);
// }
/* eslint-disable-next-line */
export interface UseMutativeProps {}

export function UseMutative(props: UseMutativeProps) {
  return (
    <div>
      <h1>Welcome to UseMutative!</h1>
    </div>
  );
}

export default UseMutative;
