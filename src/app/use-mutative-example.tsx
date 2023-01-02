import type { FC } from 'react';
import { useEffect } from 'react';
import { useMutative } from 'use-mutative';

export const UseMutativeExample: FC = () => {
  const [state, setState] = useMutative(initState);

  // update with draft in mutable way.
  const handleClick = () => {
    setState((draft) => {
      draft.title = draft.title += 'l';
      draft.cars.push({ text: '🚘' });
    });
  };

  // also can overwrite whole data directly.
  const handleReset = () => setState(initState);

  useEffect(() => {
    console.log('🚀 ~ re-render');
  });

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="text-center">
        <p className="text-2xl mt-4">{state.title}</p>
        <div className="px-2 py-1 bg-white text-black rounded">
          {state.cars.map((car, i) => (
            <span key={i}>{car.text}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button className="button button-primary" onClick={handleClick}>
          Add
        </button>
        <button className="button button-secondary" onClick={handleReset}>
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
