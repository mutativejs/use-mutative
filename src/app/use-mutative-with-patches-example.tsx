import { FC, useEffect, useRef, useState } from 'react';

import { apply, Patch } from 'mutative';
import { useMutative } from 'use-mutative';

const initState = {
  count: 0,
};

export const UseMutativeWithPatchesExample: FC = () => {
  const [state, setState, patches, inversePatches] = useMutative(initState, {
    enablePatches: true,
  });

  const [histories, setHistories] = useMutative<
    {
      patches: Patch[];
      inversePatches: Patch[];
    }[]
  >([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);

  const writeHistoryStateRef = useRef(false);

  useEffect(() => {
    if (writeHistoryStateRef.current && patches && inversePatches) {
      setHistories((draft) => {
        draft.splice(activeHistoryIndex + 1);

        draft.push({
          patches,
          inversePatches,
        });

        setActiveHistoryIndex(draft.length - 1);
      });
    }
    writeHistoryStateRef.current = false;
  }, [
    activeHistoryIndex,
    histories.length,
    inversePatches,
    patches,
    setHistories,
    state,
  ]);

  const rollbackIndex = (toIndex: number) => {
    if (toIndex === activeHistoryIndex) return;

    const currInversePatches: Patch[] = [];
    if (toIndex < activeHistoryIndex) {
      let i = activeHistoryIndex;
      while (i > toIndex) {
        currInversePatches.push(...histories[i].inversePatches);
        i--;
      }
    } else {
      let i = activeHistoryIndex + 1;
      while (i <= toIndex) {
        currInversePatches.push(...histories[i].patches);
        i++;
      }
    }

    writeHistoryStateRef.current = false;
    setActiveHistoryIndex(toIndex);
    setState((draft) => apply(draft, currInversePatches));
  };

  useEffect(() => {
    console.log('🚀 ~ re-render');
  });

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="text-center">
        <p className="text-2xl mt-4">{state.count}</p>
        <p className="text-md mt-4">Click below item to go back to that history.</p>

        <div className="px-2 py-1 bg-white text-black rounded">
          <ul className="flex flex-wrap">
            <li>
              <button
                className={`px-2 py-1 rounded ${
                  activeHistoryIndex === -1 ? 'bg-yellow-300' : ''
                }`}
                onClick={() => rollbackIndex(-1)}
              >
                <span role="img" aria-label="Start">
                  🏁
                </span>
              </button>
            </li>
            {histories.map((x, i) => {
              return (
                <li key={i}>
                  <button
                    className={`px-2 py-1 rounded ${
                      activeHistoryIndex === i ? 'bg-yellow-300' : ''
                    }`}
                    onClick={() => rollbackIndex(i)}
                  >
                    <span role="img" aria-label="Step">
                      🚘
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          className="button button-primary"
          onClick={() => {
            let i = 0;
            while (++i <= 5) {
              setState((draft) => {
                draft.count += 1;
              });
            }
            writeHistoryStateRef.current = true;
          }}
        >
          Increment
        </button>

        <div className="text-4xl flex gap-2">
          {histories.length > 0 && (
            <>
              <button
                disabled={activeHistoryIndex < 0}
                className="disabled:opacity-60"
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
                className="disabled:opacity-60"
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
        </div>
      </div>
    </div>
  );
};
