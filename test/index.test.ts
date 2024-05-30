import { jsdocTests } from 'jsdoc-tests';
import { act, renderHook } from '@testing-library/react';
import { rawReturn, type Draft, apply } from 'mutative';
import React, { useState } from 'react';

import { useMutative, useMutativeReducer } from '../src/index';

test('test "mutative" function', () => {
  jsdocTests('../src/index.ts', __dirname);
});

describe('useMutative', () => {
  it('[useMutative] with normal init state', () => {
    const { result } = renderHook(() => useMutative({ items: [1] }));
    const [state, mutateState] = result.current;
    act(() =>
      mutateState((draft) => {
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

    const [state, mutateState] = result.current;
    expect(state).toEqual([1]);
    expect(typeof mutateState).toBe('function');

    // eslint-disable-next-line prettier/prettier
    act(() => mutateState(() => [1, 2]));

    const [state2] = result.current;
    expect(state2).toEqual([1, 2]);
  });

  it('[useMutative] array state with new value', () => {
    const source: Readonly<number[]> = [1];

    const { result } = renderHook(() => useMutative(source));

    expect(result.current).toHaveLength(2);

    const [state, mutateState] = result.current;
    expect(state).toEqual([1]);
    expect(typeof mutateState).toBe('function');

    act(() => mutateState([1, 2]));

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

    const [state, mutateState] = result.current;
    expect(state).toEqual({ items: [1] });
    expect(typeof mutateState).toBe('function');

    act(() =>
      mutateState((draft) => {
        draft.items.push(2);
      })
    );

    const [state2] = result.current;
    expect(state2).toEqual({ items: [1, 2] });
  });

  it('[useMutative] with multiple updates', () => {
    const { result } = renderHook(() =>
      useMutative({
        items: [1],
      })
    );

    const [state, mutateState] = result.current;
    act(() => {
      mutateState((draft) => {
        draft.items.push(2);
      });

      mutateState((draft) => {
        draft.items.push(3);
      });
    });
    const [nextState] = result.current;
    expect(nextState).toEqual({ items: [1, 2, 3] });
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

    const [state, mutateState, patches, inversePatches] = result.current;
    expect(state).toEqual({ items: [1] });
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() =>
      mutateState((draft) => {
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

    act(() => mutateState({ items: [123] }));
    const [state3] = result.current;
    expect(state3).toEqual({ items: [123] });
  });

  it('[useMutative] with patches and multiple updates', () => {
    const baseState = [1];
    const { result } = renderHook(() =>
      useMutative(() => baseState, { enablePatches: true })
    );

    expect(result.current).toHaveLength(4);

    let [state, mutateState, patches, inversePatches] = result.current;
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState((draft) => {
        draft.push(2);
        draft.push(999);
      });
      mutateState((draft) => {
        draft.push(3);
        draft.push(4);
      });
      mutateState((draft) => {
        draft.shift();
        draft.push(5);
      });
    });

    [state, mutateState, patches, inversePatches] = result.current;
    const alterState = () => {
      const state = [1];
      state.push(2);
      state.push(999);
      //
      state.push(3);
      state.push(4);
      //
      state.shift();
      state.push(5);
      return state;
    };
    expect(baseState).toEqual([1]);
    expect(state).toEqual([2, 999, 3, 4, 5]);
    expect(alterState()).toEqual([2, 999, 3, 4, 5]);
    expect(patches).toEqual([
      { op: 'add', path: [1], value: 2 },
      { op: 'add', path: [2], value: 999 },
      { op: 'add', path: [3], value: 3 },
      { op: 'add', path: [4], value: 4 },
      { op: 'replace', path: [0], value: 2 },
      { op: 'replace', path: [1], value: 999 },
      { op: 'replace', path: [2], value: 3 },
      { op: 'replace', path: [3], value: 4 },
      { op: 'replace', path: [4], value: 5 },
    ]);
    expect(inversePatches).toEqual([
      { op: 'replace', path: [0], value: 1 },
      { op: 'replace', path: [1], value: 2 },
      { op: 'replace', path: [2], value: 999 },
      { op: 'replace', path: [3], value: 3 },
      { op: 'replace', path: [4], value: 4 },
      { op: 'replace', path: ['length'], value: 3 },
      { op: 'replace', path: ['length'], value: 1 },
    ]);
    expect(apply(baseState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(baseState);
  });

  it('[useMutative] with patches and multiple updates, other state ', () => {
    const baseState = [1];
    const { result } = renderHook(() => {
      return [
        useMutative(() => baseState, { enablePatches: true }) as any,
        useState(0),
      ];
    });

    let [
      [state, mutateState, patches, inversePatches],
      [state0, mutateState0],
    ] = result.current;
    expect(state0).toEqual(0);
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState0(1);
    });

    [[state, mutateState, patches, inversePatches], [state0, mutateState0]] =
      result.current;
    expect(state0).toEqual(1);
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState((draft: any) => {
        draft.push(2);
        draft.push(999);
      });
      mutateState((draft: any) => {
        draft.push(3);
        draft.push(4);
      });
      mutateState((draft: any) => {
        draft.shift();
        draft.push(5);
      });
    });

    [[state, mutateState, patches, inversePatches], [state0, mutateState0]] =
      result.current;
    const alterState = () => {
      const state = [1];
      state.push(2);
      state.push(999);
      //
      state.push(3);
      state.push(4);
      //
      state.shift();
      state.push(5);
      return state;
    };
    expect(baseState).toEqual([1]);
    expect(state).toEqual([2, 999, 3, 4, 5]);
    expect(alterState()).toEqual([2, 999, 3, 4, 5]);
    expect(patches).toEqual([
      { op: 'add', path: [1], value: 2 },
      { op: 'add', path: [2], value: 999 },
      { op: 'add', path: [3], value: 3 },
      { op: 'add', path: [4], value: 4 },
      { op: 'replace', path: [0], value: 2 },
      { op: 'replace', path: [1], value: 999 },
      { op: 'replace', path: [2], value: 3 },
      { op: 'replace', path: [3], value: 4 },
      { op: 'replace', path: [4], value: 5 },
    ]);
    expect(inversePatches).toEqual([
      { op: 'replace', path: [0], value: 1 },
      { op: 'replace', path: [1], value: 2 },
      { op: 'replace', path: [2], value: 999 },
      { op: 'replace', path: [3], value: 3 },
      { op: 'replace', path: [4], value: 4 },
      { op: 'replace', path: ['length'], value: 3 },
      { op: 'replace', path: ['length'], value: 1 },
    ]);
    expect(apply(baseState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(baseState);
  });

  it('[useMutative] with patches and multiple updates in StrictMode', () => {
    const baseState = [1];
    const { result } = renderHook(
      () => useMutative(() => baseState, { enablePatches: true }),
      { wrapper: React.StrictMode }
    );

    expect(result.current).toHaveLength(4);

    let [state, mutateState, patches, inversePatches] = result.current;
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState((draft) => {
        draft.push(2);
        draft.push(999);
      });
      mutateState((draft) => {
        draft.push(3);
        draft.push(4);
      });
      mutateState((draft) => {
        draft.shift();
        draft.push(5);
      });
    });

    [state, mutateState, patches, inversePatches] = result.current;
    const alterState = () => {
      const state = [1];
      state.push(2);
      state.push(999);
      //
      state.push(3);
      state.push(4);
      //
      state.shift();
      state.push(5);
      return state;
    };
    expect(baseState).toEqual([1]);
    expect(state).toEqual([2, 999, 3, 4, 5]);
    expect(alterState()).toEqual([2, 999, 3, 4, 5]);
    expect(patches).toEqual([
      { op: 'add', path: [1], value: 2 },
      { op: 'add', path: [2], value: 999 },
      { op: 'add', path: [3], value: 3 },
      { op: 'add', path: [4], value: 4 },
      { op: 'replace', path: [0], value: 2 },
      { op: 'replace', path: [1], value: 999 },
      { op: 'replace', path: [2], value: 3 },
      { op: 'replace', path: [3], value: 4 },
      { op: 'replace', path: [4], value: 5 },
    ]);
    expect(inversePatches).toEqual([
      { op: 'replace', path: [0], value: 1 },
      { op: 'replace', path: [1], value: 2 },
      { op: 'replace', path: [2], value: 999 },
      { op: 'replace', path: [3], value: 3 },
      { op: 'replace', path: [4], value: 4 },
      { op: 'replace', path: ['length'], value: 3 },
      { op: 'replace', path: ['length'], value: 1 },
    ]);
    expect(apply(baseState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(baseState);
  });

  it('[useMutative] with patches and multiple updates, other state in StrictMode', () => {
    const baseState = [1];
    const { result } = renderHook(
      () => {
        return [
          useMutative(() => baseState, { enablePatches: true }) as any,
          useState(0),
        ];
      },
      { wrapper: React.StrictMode }
    );

    let [
      [state, mutateState, patches, inversePatches],
      [state0, mutateState0],
    ] = result.current;
    expect(state0).toEqual(0);
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState0(1);
    });

    [[state, mutateState, patches, inversePatches], [state0, mutateState0]] =
      result.current;
    expect(state0).toEqual(1);
    expect(state).toEqual([1]);
    expect(patches).toEqual([]);
    expect(inversePatches).toEqual([]);

    act(() => {
      mutateState((draft: any) => {
        draft.push(2);
        draft.push(999);
      });
      mutateState((draft: any) => {
        draft.push(3);
        draft.push(4);
      });
      mutateState((draft: any) => {
        draft.shift();
        draft.push(5);
      });
    });

    [[state, mutateState, patches, inversePatches], [state0, mutateState0]] =
      result.current;
    const alterState = () => {
      const state = [1];
      state.push(2);
      state.push(999);
      //
      state.push(3);
      state.push(4);
      //
      state.shift();
      state.push(5);
      return state;
    };
    expect(baseState).toEqual([1]);
    expect(state).toEqual([2, 999, 3, 4, 5]);
    expect(alterState()).toEqual([2, 999, 3, 4, 5]);
    expect(patches).toEqual([
      { op: 'add', path: [1], value: 2 },
      { op: 'add', path: [2], value: 999 },
      { op: 'add', path: [3], value: 3 },
      { op: 'add', path: [4], value: 4 },
      { op: 'replace', path: [0], value: 2 },
      { op: 'replace', path: [1], value: 999 },
      { op: 'replace', path: [2], value: 3 },
      { op: 'replace', path: [3], value: 4 },
      { op: 'replace', path: [4], value: 5 },
    ]);
    expect(inversePatches).toEqual([
      { op: 'replace', path: [0], value: 1 },
      { op: 'replace', path: [1], value: 2 },
      { op: 'replace', path: [2], value: 999 },
      { op: 'replace', path: [3], value: 3 },
      { op: 'replace', path: [4], value: 4 },
      { op: 'replace', path: ['length'], value: 3 },
      { op: 'replace', path: ['length'], value: 1 },
    ]);
    expect(apply(baseState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(baseState);
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
    const { result } = renderHook(() =>
      useMutativeReducer(
        reducer,
        initState,
        (state) => {
          state.title = 'changed title ';
          return state;
        },
        { enablePatches: true }
      )
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

    act(() => {
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
    });

    const [state1, dispatch1, patches1, inversePatches1] = result.current;
    expect(state1).toEqual({
      title: 'changed title ll',
      cars: [{ text: '🚘' }, { text: '🚘' }, { text: '🚘' }],
    });
    expect(apply(state, patches1)).toEqual(state1);
    expect(apply(state1, inversePatches1)).toEqual(state);

    act(() => dispatch1({ type: 'reset' }));

    const [state2, dispatch2, patches2, inversePatches2] = result.current;
    expect(state2).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });
    expect(apply(state1, patches2)).toEqual(state2);
    expect(apply(state2, inversePatches2)).toEqual(state1);
  });

  it('[useMutativeReducer] with patches in StrictMode', () => {
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

    act(() => {
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
    });

    const [state1, dispatch1, patches1, inversePatches1] = result.current;
    expect(state1).toEqual({
      title: 'changed title ll',
      cars: [{ text: '🚘' }, { text: '🚘' }, { text: '🚘' }],
    });
    expect(apply(state, patches1)).toEqual(state1);
    expect(apply(state1, inversePatches1)).toEqual(state);

    act(() => dispatch1({ type: 'reset' }));

    const [state2, dispatch2, patches2, inversePatches2] = result.current;
    expect(state2).toEqual({
      title: 'changed title ',
      cars: [{ text: '🚘' }],
    });
    expect(apply(state1, patches2)).toEqual(state2);
    expect(apply(state2, inversePatches2)).toEqual(state1);
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

    const copyInitState = JSON.parse(JSON.stringify(initState));
    const mutateState = () => {
      const dispatch = (action: any) => reducer(copyInitState, action);
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      return copyInitState;
    };

    const [state, , patches, inversePatches] = result.current;
    expect(state).toEqual(mutateState());
    expect(apply(initState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(initState);
  });

  it('[useMutativeReducer] show dispatch many times in one tick and StrictMode', () => {
    const { result } = renderHook(
      () =>
        useMutativeReducer(reducer, initState, undefined, {
          enablePatches: true,
        }),
      { wrapper: React.StrictMode }
    );
    const [, dispatch] = result.current;

    act(() => {
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
    });

    const copyInitState = JSON.parse(JSON.stringify(initState));
    const mutateState = () => {
      const dispatch = (action: any) => reducer(copyInitState, action);
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      dispatch({ type: 'increment' });
      return copyInitState;
    };

    const [state, , patches, inversePatches] = result.current;
    expect(state).toEqual(mutateState());
    expect(apply(initState, patches)).toEqual(state);
    expect(apply(state, inversePatches)).toEqual(initState);
  });
});
