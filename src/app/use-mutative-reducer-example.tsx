import { FC, useEffect } from 'react';

import { useMutativeReducer } from 'use-mutative';

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

export const UseMutativeReducerExample: FC = () => {
  const [state, dispatch, patchState] = useMutativeReducer(
    reducer,
    initState,
    undefined,
    { enablePatches: true }
  );

  useEffect(() => {
    console.log('🚀 ~ re-render', patchState);
  });

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="text-center">
        <p className="text-2xl mt-4">{state.title}</p>
        <div className="px-2 py-1 bg-white text-black rounded min-h-[32px]">
          {state.cars.map((car, i) => (
            <span key={i}>{car.text}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-wrap">
        <button
          className="button button-primary"
          onClick={() => dispatch({ type: 'increment' })}
        >
          Increment
        </button>
        <button
          className="button button-primary"
          onClick={() => dispatch({ type: 'decrement' })}
        >
          Decrement
        </button>
        <button
          className="button button-secondary"
          onClick={() => dispatch({ type: 'reset' })}
        >
          rest
        </button>
      </div>
    </div>
  );
};

const initState = {
  title: 'cool',
  cars: [{ text: '🚘' }],
};
