import { act, renderHook } from '@testing-library/react';

import { useMutative } from './use-mutative';

describe('useMutative', () => {
  it('[useMutative] with normal init state', () => {
    const source: Readonly<{ items: number[] }> = { items: [1] };

    const { result } = renderHook(() => useMutative(source));

    expect(result.current).toHaveLength(2);

    const [state, setState] = result.current;
    expect(state).toEqual({ items: [1] });
    expect(typeof setState).toBe('function');

    act(() =>
      setState((draft) => {
        // this type will not be readonly anymore
        draft.items.push(2);
      })
    );

    const [state2] = result.current;
    expect(state2).toEqual({ items: [1, 2] });
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
    expect(patches).toBe(undefined);
    expect(inversePatches).toBe(undefined);

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
