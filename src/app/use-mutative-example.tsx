import { FC } from 'react';

import { useMutative } from 'use-mutative';

export const UseMutativeExample: FC = () => {
  const [state, setState] = useMutative({
    foo: 'bar',
    list: [
      { text: 'todo' },
      { text: 'todo' },
      { text: 'todo' },
      { text: 'todo' },
    ],
  });

  return (
    <div>
      <button
        onClick={() => {
          setState((draft) => {
            draft.foo = `${draft.foo}1`;
          });
        }}
      >
        click
      </button>
      <button
        onClick={() => {
          setState({
            foo: '10',
            list: [{ text: 'a' }, { text: 'a' }, { text: 'a' }, { text: 'a' }],
          });
        }}
      >
        click
      </button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};
