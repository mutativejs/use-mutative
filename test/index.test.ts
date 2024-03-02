import { jsdocTests } from 'jsdoc-tests';
import { act, renderHook } from '@testing-library/react';
import { rawReturn, type Draft } from 'mutative';
import React from 'react';

import { useMutative, useMutativeReducer } from '../src/index';

test('test "mutative" function', () => {
  jsdocTests('./src/index.ts');
});

describe('useMutative', () => {
  it('[useMutative] with normal init state', () => {
    const { result } = renderHook(() => useMutative({ items: [1] }));
    const [state, setState] = result.current;
    act(() =>
      setState((draft) => {
        draft.items.push(2);
      })
    );
    const [nextState] = result.current;
    expect(nextState).toEqual({ items: [1, 2] });
  });

  it('[useMutative] array state with callback return', () => {
    const source: Readonly<number[]> = [1];

    const { result } = renderHook(() => useMutative(source));

    expect(result.current).toHaveLength(2);

    const [state, setState] = result.current;
    expect(state).toEqual([1]);
    expect(typeof setState).toBe('function');

    // eslint-disable-next-line prettier/prettier
    act(() => setState(() => [1, 2]));

    const [state2] = result.current;
    expect(state2).toEqual([1, 2]);
  });

  it('[useMutative] array state with new value', () => {
    const source: Readonly<number[]> = [1];

    const { result } = renderHook(() => useMutative(source));

    expect(result.current).toHaveLength(2);

    const [state, setState] = result.current;
    expect(state).toEqual([1]);
    expect(typeof setState).toBe('function');

    act(() => setState([1, 2]));

    const [state2] = result.current;
    expect(state2).toEqual([1, 2]);
  });

  it('[useMutative] with initializer', () => {
    const { result } = renderHook(() =>
      useMutative(() => ({
        items: [1],
      }))
    );

    expect(result.current).toHaveLength(2);

    const [state, setState] = result.current;
    expect(state).toEqual({ items: [1] });
    expect(typeof setState).toBe('function');

    act(() =>
      setState((draft) => {
        draft.items.push(2);
      })
    );

    const [state2] = result.current;
    expect(state2).toEqual({ items: [1, 2] });
  });

  it('[useMutative] with patches', () => {
    const { result } = renderHook(() =>
      useMutative(
        () => ({
          items: [1],
        }),
        { enablePatches: true }
      )
    );

    expect(result.current).toHaveLength(4);

    const [state, setState, patches, inversePatches] = result.current;
    expect(state).toEqual({ items: [1] });
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() =>
      setState((draft) => {
        draft.items.push(2);
      })
    );

    const [state2, , patches2, inversePatches2] = result.current;

    expect(state2).toEqual({ items: [1, 2] });
    expect(patches2).toHaveLength(1);
    expect(patches2).toEqual([{ op: 'add', path: ['items', 1], value: 2 }]);
    expect(inversePatches2).toHaveLength(1);
    expect(inversePatches2).toEqual([
      { op: 'replace', path: ['items', 'length'], value: 1 },
    ]);

    act(() => setState({ items: [123] }));
    const [state3] = result.current;
    expect(state3).toEqual({ items: [123] });
  });
});

describe('useMutativeReducer', () => {
  const initState = {
    title: 'cool',
    cars: [{ text: '🚘' }],
  };

  function reducer(
    draft: Draft<Readonly<typeof initState>>,
    action: {
      type: 'reset' | 'increment' | 'decrement' | 'reset-with-rawReturn';
    }
  ) {
    switch (action.type) {
      case 'reset':
        return initState;
      case 'reset':
        // !!! this will improve the performance
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

    const [state1, dispatch1, patches1, inversePatches1] = result.current;
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

    const [state2, dispatch2, patches2, inversePatches2] = result.current;
    expect(state2).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });

    expect(patches2).toEqual([
      {
        op: 'replace',
        path: [],
        value: { title: 'changed title ', cars: [{ text: '🚘' }] },
      },
    ]);
    expect(inversePatches2).toEqual([
      {
        op: 'replace',
        path: [],
        value: {
          title: 'changed title l',
          cars: [{ text: '🚘' }, { text: '🚘' }],
        },
      },
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
        title: 'changed title lllll',
        cars: [
          {
            text: '🚘',
          },
          {
            text: '🚘',
          },
          {
            text: '🚘',
          },
          {
            text: '🚘',
          },
          {
            text: '🚘',
          },
          {
            text: '🚘',
          },
        ],
      },
      [
        {
          op: 'add',
          path: ['cars', 5],
          value: {
            text: '🚘',
          },
        },
        {
          op: 'replace',
          path: ['title'],
          value: 'changed title lllll',
        },
      ],
      [
        {
          op: 'replace',
          path: ['cars', 'length'],
          value: 5,
        },
        {
          op: 'replace',
          path: ['title'],
          value: 'changed title llll',
        },
      ],
    ]);
  });
});
