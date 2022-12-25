import { FC } from 'react';

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
  const [state, dispatch] = useMutativeReducer(reducer, initialState);

  return (
    <div>
      Count: {state.count}
      <br />
      <br />
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
};
