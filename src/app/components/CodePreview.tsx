import 'prismjs/themes/prism-okaidia.css';

import { FC } from 'react';

import Highlight, { defaultProps, Language } from 'prism-react-renderer';

import { CopyButton } from './CopyButton';

type CodePreviewProps = {
  code: string;
  language?: Language;
  classes?: {
    root?: string;
    copyButton?: string;
  };
};

export const CodePreview: FC<CodePreviewProps> = ({
  code,
  language = 'tsx',
  classes = {},
}) => {
  const { root, copyButton } = classes;
  return (
    <div className={`flex ${root} h-full overflow-hidden relative rounded`}>
      <div className="w-full overflow-auto [&>pre]:!m-0">
        <Highlight
          {...defaultProps}
          code={code}
          language={language}
          theme={undefined}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            // define how each line is to be rendered in the code block,
            // position is set to relative so the copy button can align to bottom right
            <pre
              className={className}
              style={{ ...style, position: 'relative' }}
            >
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
      </div>
      <CopyButton
        data-copy
        className={`copy-button absolute right-2 top-1 ${copyButton}`}
        code={code}
      />
    </div>
  );
};
