import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

type CopyButtonProps = {
  code: string;
  className?: string;
};

export const CopyButton: FC<CopyButtonProps> = ({ code, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = () => {
    clearTimeout(timer.current);
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      timer.current = setTimeout(() => setIsCopied(false), 3000);
    });
  };

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    []
  );

  return (
    <div {...props}>
      {isCopied ? (
        <p className="p-2 pt-1">
          <span role="img" aria-label="Copied">
            ✅
          </span>
        </p>
      ) : (
        <button onClick={handleCopy} className="p-2 bg-gray-100/10 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
      )}
    </div>
  );
};
