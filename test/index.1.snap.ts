import { act, renderHook } from '@testing-library/react';
import { type Draft } from 'mutative';

import { useMutativeReducer } from '../src/index';

const { result } = renderHook(() =>
  useMutativeReducer(
    (
      draft: Draft<Readonly<{ count: number }>>,
      action: {
        type: 'increment';
      }
    ) => {
      switch (action.type) {
        case 'increment':
          draft.count += 1;
      }
    },
    { count: 0 }
  )
);
const [, dispatch] = result.current;
act(() => dispatch({ type: 'increment' }));
expect(result.current[0]).toEqual({ count: 1 });
