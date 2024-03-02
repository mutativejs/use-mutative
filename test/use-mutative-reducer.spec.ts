import { act, renderHook } from '@testing-library/react';
import { rawReturn, type Draft } from 'mutative';
import React from 'react';

import { useMutativeReducer } from '../src/index';

const initState = {
  title: 'cool',
  cars: [{ text: '🚘' }],
};

function reducer(
  draft: Draft<Readonly<typeof initState>>,
  action: { type: 'reset' | 'increment' | 'decrement' | 'reset-with-rawReturn' }
) {
  switch (action.type) {
    case 'reset':
      return initState;
    case 'reset':
      return rawReturn(initState);
    case 'increment':
      draft.title += 'l';
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

    expect(result.current).toHaveLength(4);

    const [state, dispatch, patches, inversePatches] = result.current;
    expect(state).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });

    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    expect(typeof dispatch).toBe('function');

    act(() => dispatch({ type: 'increment' }));

    const [state1, dispatch1 ,patches1, inversePatches1] = result.current;
    expect(state1).toEqual({
      title: 'changed title l',
      cars: [{ text: '🚘' }, { text: '🚘' }],
    });

    expect(patches1).toEqual([
      { op: 'add', path: ['cars', 1], value: { text: '🚘' } },
      { op: 'replace', path: ['title'], value: 'changed title l' },
    ]);
    expect(inversePatches1).toEqual([
      { op: 'replace', path: ['cars', 'length'], value: 1 },
      { op: 'replace', path: ['title'], value: 'changed title ' },
    ]);

    act(() => dispatch1({ type: 'reset' }));

    const [state2, dispatch2 ,patches2, inversePatches2] = result.current;
    expect(state2).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });

    expect(patches2).toEqual([
      {
        op: 'replace',
        path: [],
        value: { title: 'changed title ', cars: [{ text: '🚘' }] }
      }
    ]);
    expect(inversePatches2).toEqual([
      {
        op: 'replace',
        path: [],
        value: { title: 'changed title l', cars: [{ text: '🚘' }, { text: '🚘' }] }
      }
    ]);
  });

  it('[useMutativeReducer] show warning when change `enablePatches` dynamically', () => {
    const spy = jest.spyOn(console, 'warn');
    const { result, rerender } = renderHook(
      ({ enablePatches = true }: { enablePatches?: boolean } = {}) =>
        useMutativeReducer(reducer, initState, undefined, { enablePatches })
    );
    const [, dispatch] = result.current;

    rerender({ enablePatches: false });
    act(() => dispatch({ type: 'reset' }));

    expect(spy).toHaveBeenCalledTimes(1);

    act(() => dispatch({ type: 'reset-with-rawReturn' }));

    expect(spy).toHaveBeenCalledTimes(1);
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

    const [state, , patches, inversePatches] = result.current;

    expect([state, patches, inversePatches]).toEqual([
      {
        "title": "changed title lllll",
        "cars": [
          {
            "text": "🚘"
          },
          {
            "text": "🚘"
          },
          {
            "text": "🚘"
          },
          {
            "text": "🚘"
          },
          {
            "text": "🚘"
          },
          {
            "text": "🚘"
          }
        ]
      },
      [
        {
          "op": "add",
          "path": [
            "cars",
            5
          ],
          "value": {
            "text": "🚘"
          }
        },
        {
          "op": "replace",
          "path": [
            "title"
          ],
          "value": "changed title lllll"
        }
      ],
      [
        {
          "op": "replace",
          "path": [
            "cars",
            "length"
          ],
          "value": 5
        },
        {
          "op": "replace",
          "path": [
            "title"
          ],
          "value": "changed title llll"
        }
      ]
    ]);
  });
});
