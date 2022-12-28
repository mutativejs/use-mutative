import { FC, useEffect, useRef, useState } from 'react';

import { apply, Patch } from 'mutative';
import { useMutative } from 'use-mutative';

export const UseMutativeWithPatchesExample: FC = () => {
  const [count, setCount] = useState(0);
  const [state, setState, patches, inversePatches] = useMutative(
    {
      foo: 0,
    },
    { enablePatches: true }
  );

  const [histories, setHistories] = useMutative<
    {
      patches: Patch[];
      inversePatches: Patch[];
    }[]
  >([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);

  const writeHistoryStateRef = useRef(false);

  useEffect(() => {
    if (patches && inversePatches) {
      if (writeHistoryStateRef.current) {
        setHistories((draft) => {
          draft.splice(activeHistoryIndex + 1);

          draft.push({
            patches,
            inversePatches,
          });

          setActiveHistoryIndex(draft.length - 1);
        });
      }
    }
    writeHistoryStateRef.current = false;
  }, [
    activeHistoryIndex,
    histories.length,
    inversePatches,
    patches,
    setHistories,
  ]);

  return (
    <div>
      <br />
      <br />

      <button
        onClick={() => {
          setCount((c) => c + 1);
        }}
      >
        force re-render button {count}
      </button>
      <br />
      <br />
      <button
        onClick={() => {
          let i = 0;

          while (++i <= 5) {
            setState((draft) => {
              draft.foo += 1;
            });
          }
          writeHistoryStateRef.current = true;
        }}
      >
        +
      </button>
      {histories.length > 0 && (
        <>
          <button
            disabled={activeHistoryIndex < 0}
            onClick={() => {
              writeHistoryStateRef.current = false;

              const currHistory = histories[activeHistoryIndex];
              setActiveHistoryIndex(activeHistoryIndex - 1);
              setState((draft) => apply(draft, currHistory.inversePatches));
            }}
          >
            <span role="img" aria-label="Backward">
              ↩️
            </span>
          </button>
          <button
            disabled={activeHistoryIndex + 1 === histories.length}
            onClick={() => {
              writeHistoryStateRef.current = false;

              const nextIndex = activeHistoryIndex + 1;
              const currHistory = histories[nextIndex];
              setActiveHistoryIndex(nextIndex);
              setState((draft) => apply(draft, currHistory.patches));
            }}
          >
            <span role="img" aria-label="Backward">
              ↪️
            </span>
          </button>
        </>
      )}
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <h4>Histories</h4>
      <ul>
        <li
          style={{
            backgroundColor: activeHistoryIndex === -1 ? 'yellow' : undefined,
          }}
        >
          origin
        </li>
        {histories.map((x, i) => {
          return (
            <li
              key={i}
              style={{
                backgroundColor:
                  activeHistoryIndex === i ? 'yellow' : undefined,
              }}
            >
              {i}
            </li>
          );
        })}
      </ul>
      <pre>{JSON.stringify(histories, null, 2)}</pre>
    </div>
  );
};
