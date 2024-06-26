import { act, renderHook } from '@testing-library/react';

import { useMutative } from '../src/index';

const { result } = renderHook(() => useMutative({ items: [1] }));
const [state, updateState] = result.current;
act(() =>
  updateState((draft) => {
    draft.items.push(2);
  })
);
const [nextState] = result.current;
expect(nextState).toEqual({ items: [1, 2] });
