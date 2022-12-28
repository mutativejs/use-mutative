import { FC, useEffect } from 'react';

import { useMutativeReducer } from 'use-mutative';

type State = { count: number };

const initialState = { count: 0 };

function reducer(
  draft: State,
  action: { type: 'reset' | 'increment' | 'decrement' }
) {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'increment':
      return void draft.count++;
    case 'decrement':
      return void draft.count--;
  }
}

export const UseMutativeReducerExample: FC = () => {
  console.log('UseMutativeReducerExample');
  const [state, dispatch, patchState] = useMutativeReducer(
    reducer,
    initialState,
    undefined,
    { enablePatches: true }
  );

  useEffect(() => {
    console.log('🚀 ~ patchState', patchState);
  });

  return (
    <div>
      Count: {state.count}
      <br />
      <br />
      <button
        onClick={() => {
          let i = 0;

          while (++i <= 5) {
            dispatch({ type: 'increment' });
          }
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          let i = 0;

          while (++i <= 5) {
            dispatch({ type: 'decrement' });
          }
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          dispatch({ type: 'decrement' });
          dispatch({ type: 'decrement' });
          dispatch({ type: 'decrement' });
          dispatch({ type: 'reset' });
          dispatch({ type: 'increment' });
          dispatch({ type: 'increment' });
          dispatch({ type: 'increment' });
          dispatch({ type: 'decrement' });
          dispatch({ type: 'decrement' });
          dispatch({ type: 'decrement' });
        }}
      >
        <span role="img" aria-label="clear">
          🧹
        </span>
      </button>
    </div>
  );
};
