import 'prismjs/themes/prism-okaidia.css';

import { FC } from 'react';

import Highlight, { defaultProps } from 'prism-react-renderer';

import { CopyButton } from './CopyButton';

type CodePreviewProps = {
  code: string;
};

export const CodePreview: FC<CodePreviewProps> = ({ code }) => {
  return (
    <Highlight {...defaultProps} code={code} language="tsx" theme={undefined}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        // define how each line is to be rendered in the code block,
        // position is set to relative so the copy button can align to bottom right
        <pre className={className} style={{ ...style, position: 'relative' }}>
          <CopyButton className="absolute right-1 top-1" code={code} />
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
