/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { act, renderHook } from '@testing-library/react';
import type { Draft } from 'mutative';
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
  draft: Draft<Readonly<typeof initState>>,
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
    expect(patchState2!.patches).toEqual([
      [
        {
          op: 'replace',
          path: [],
          value: {
            cars: [
              {
                text: '🚘',
              },
            ],
            title: 'changed title ',
          },
        },
      ],
      [
        {
          op: 'replace',
          path: [],
          value: {
            cars: [
              {
                text: '🚘',
              },
              {
                text: '🚘',
              },
            ],
            title: 'changed title l',
          },
        },
      ],
    ]);
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

  it('[useMutativeReducer] show dispatch many times in one tick', () => {
    const { result } = renderHook(() =>
      useMutativeReducer(reducer, initState, undefined, { enablePatches: true })
    );
    const [, dispatch] = result.current;

    act(() => {
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
    });

    const [state, , patchGroup] = result.current;

    expect(state).toEqual({
      title: 'changed title lllll',
      cars: [
        { text: '🚘' },
        { text: '🚘' },
        { text: '🚘' },
        { text: '🚘' },
        { text: '🚘' },
        { text: '🚘' },
      ],
    });

    expect(patchGroup).toEqual({
      actions: [
        { type: 'increment' },
        { type: 'increment' },
        { type: 'increment' },
        { type: 'increment' },
        { type: 'increment' },
      ],
      patches: [
        [
          { op: 'add', path: ['cars', 1], value: { text: '🚘' } },
          { op: 'add', path: ['cars', 2], value: { text: '🚘' } },
          { op: 'add', path: ['cars', 3], value: { text: '🚘' } },
          { op: 'add', path: ['cars', 4], value: { text: '🚘' } },
          { op: 'add', path: ['cars', 5], value: { text: '🚘' } },
          { op: 'replace', path: ['title'], value: 'changed title lllll' },
        ],
        [
          { op: 'replace', path: ['cars', 'length'], value: 1 },
          { op: 'replace', path: ['title'], value: 'changed title ' },
        ],
      ],
    });
  });
});
