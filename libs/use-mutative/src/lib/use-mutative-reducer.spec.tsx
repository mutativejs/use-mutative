/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { act, renderHook } from '@testing-library/react';
import React from 'react';

import {
  useMutativeReducer,
  MUTATIVE_ROOT_OVERRIDE,
} from './use-mutative-reducer';

const initState = {
  title: 'cool',
  cars: [{ text: '🚘' }],
};

function reducer(
  draft: typeof initState,
  action: { type: 'reset' | 'increment' | 'decrement' }
) {
  switch (action.type) {
    case 'reset':
      return initState;
    case 'increment':
      draft.title = draft.title += 'l';
      draft.cars.push({ text: '🚘' });
      return void 0;
    case 'decrement':
      draft.title = draft.title.slice(0, -1);
      draft.cars.pop();
      return void 0;
  }
}

describe('useMutativeReducer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // it.only('should get the latest message with a spy', () => {
  //   const spy = vi.spyOn(mutative, 'create');
  //   expect(spy.getMockName()).toEqual('create');

  //   mutative.create({}, () => {
  //     //
  //   });

  //   expect(spy).toBeCalled();
  // });

  it('[useMutativeReducer] with normal init state', () => {
    const { result } = renderHook(() => useMutativeReducer(reducer, initState));

    expect(result.current).toHaveLength(2);

    const [state, dispatch] = result.current;
    expect(state).toEqual({
      title: 'cool',
      cars: [{ text: '🚘' }],
    });
    expect(typeof dispatch).toBe('function');

    act(() => dispatch({ type: 'increment' }));

    const [state2] = result.current;
    expect(state2).toEqual({
      title: 'cooll',
      cars: [{ text: '🚘' }, { text: '🚘' }],
    });
  });

  it('[useMutativeReducer] with initializer', () => {
    const { result } = renderHook(() =>
      useMutativeReducer(reducer, initState, (state) => {
        state.title = 'changed title ';
        return state;
      })
    );

    expect(result.current).toHaveLength(2);

    const [state, dispatch] = result.current;
    expect(state).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });
    expect(typeof dispatch).toBe('function');

    act(() => dispatch({ type: 'increment' }));

    const [state2] = result.current;
    expect(state2).toEqual({
      title: 'changed title l',
      cars: [{ text: '🚘' }, { text: '🚘' }],
    });
  });

  it('[useMutativeReducer] with patches', () => {
    const { result } = renderHook(
      () =>
        useMutativeReducer(
          reducer,
          initState,
          (state) => {
            state.title = 'changed title ';
            return state;
          },
          { enablePatches: true }
        ),
      { wrapper: React.StrictMode }
    );

    expect(result.current).toHaveLength(3);

    const [state, dispatch] = result.current;
    expect(state).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });
    expect(typeof dispatch).toBe('function');

    act(() => dispatch({ type: 'increment' }));

    const [state2] = result.current;
    expect(state2).toEqual({
      title: 'changed title l',
      cars: [{ text: '🚘' }, { text: '🚘' }],
    });

    const [, , patchState] = result.current;

    expect(patchState!.actions).toEqual([{ type: 'increment' }]);
    const [patches, inversePatches] = patchState!.patches;
    expect(patches).toEqual([
      { op: 'add', path: ['cars', 1], value: { text: '🚘' } },
      { op: 'replace', path: ['title'], value: 'changed title l' },
    ]);
    expect(inversePatches).toEqual([
      { op: 'replace', path: ['cars', 'length'], value: 1 },
      { op: 'replace', path: ['title'], value: 'changed title ' },
    ]);

    act(() => dispatch({ type: 'reset' }));

    const [, , patchState2] = result.current;

    expect(patchState2!.actions).toBe(MUTATIVE_ROOT_OVERRIDE);
  });

  it('[useMutativeReducer] show warning when change `enablePatches` dynamically', () => {
    const spy = vi.spyOn(console, 'warn');
    const { result, rerender } = renderHook(
      ({ enablePatches = true }: { enablePatches?: boolean } = {}) =>
        useMutativeReducer(reducer, initState, undefined, { enablePatches })
    );
    const [, dispatch] = result.current;

    rerender({ enablePatches: false });
    act(() => dispatch({ type: 'reset' }));

    expect(spy).toBeCalled();
    expect(spy).toBeCalledTimes(2);
  });
});
