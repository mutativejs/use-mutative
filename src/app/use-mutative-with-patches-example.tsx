import { FC } from 'react';

import { apply, Patch } from 'mutative';
import { useMutative } from 'use-mutative';

export const UseMutativeWithPatchesExample: FC = () => {
  const [state, setState] = useMutative(
    {
      foo: 1,
    },
    { enablePatches: true }
  );

  const [inverseHistories, setInverseHistories] = useMutative<Patch[]>([]);
  const [histories, setHistories] = useMutative<Patch[]>([]);

  return (
    <div>
      <button
        onClick={() => {
          const [, inversePatches] = setState((draft) => {
            draft.foo += 1;
          });

          setInverseHistories((draft) => draft.push(...inversePatches));
          setHistories([]);
        }}
      >
        +
      </button>
      {inverseHistories.length > 0 && (
        <button
          onClick={() => {
            const lastHistory = inverseHistories.splice(-1);

            const [, inversePatches] = setState((draft) =>
              apply(draft, lastHistory)
            );

            setHistories((draft) => draft.push(...inversePatches));
          }}
        >
          <span role="img" aria-label="Backward">
            ↩️
          </span>
        </button>
      )}
      {histories.length > 0 && (
        <button
          onClick={() => {
            const lastHistory = histories.splice(-1);
            const [, inversePatches] = setState((draft) =>
              apply(draft, lastHistory)
            );

            setInverseHistories((draft) => draft.push(...inversePatches));
          }}
        >
          <span role="img" aria-label="Backward">
            ↪️
          </span>
        </button>
      )}
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <pre>{JSON.stringify(inverseHistories, null, 2)}</pre>
    </div>
  );
};
