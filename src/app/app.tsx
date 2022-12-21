import { useEffect } from 'react';

import { useMutative } from 'use-mutative';

export function App() {
  const [state, setState, patches] = useMutative(
    {
      foo: 'bar',
      list: [
        { text: 'todo' },
        { text: 'todo' },
        { text: 'todo' },
        { text: 'todo' },
      ],
    },
    { enablePatches: true }
  );

  useEffect(() => {
    console.log('🚀 ~ state', state);
    console.log('🚀 ~ patches', patches);
  });

  return (
    <div>
      <button
        onClick={() => {
          const [patches, inversePatches] = setState((draft) => {
            draft.foo = `${draft.foo}1`;
            draft.list.splice(-1);
          });
          console.log('🚀 ~ patches, inversePatches', patches, inversePatches);
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
      {state.list.map((x, i) => (
        <div key={i}>{x.text}</div>
      ))}
    </div>
  );
}

export default App;
