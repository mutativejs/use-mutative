/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';

import { CodePreview } from './components/CodePreview';
import { GitHub } from './components/GitHub';
import { UseMutativeExample } from './use-mutative-example';
// @ts-ignore
import useMutativeExampleCode from './use-mutative-example?raw';
import { UseMutativeReducerExample } from './use-mutative-reducer-example';
// @ts-ignore
import useMutativeReducerExampleCode from './use-mutative-reducer-example?raw';
import { UseMutativeWithPatchesExample } from './use-mutative-with-patches-example';
// @ts-ignore
import useMutativeWithPatchesExampleCode from './use-mutative-with-patches-example?raw';

const activeClassName = 'bg-yellow-300 text-black font-bold';

const viewMap = {
  useMutative: {
    title: 'useMutative',
    code: useMutativeExampleCode,
    component: UseMutativeExample,
  },
  useMutativeReducer: {
    title: 'useMutativeReducer',
    code: useMutativeReducerExampleCode,
    component: UseMutativeReducerExample,
  },
  patches: {
    title: 'Patches',
    code: useMutativeWithPatchesExampleCode,
    component: UseMutativeWithPatchesExample,
  },
};

type ViewMapKey = keyof typeof viewMap;

const tabs = Object.keys(viewMap) as unknown as ViewMapKey[];

const initActiveTab = document.location.hash.replace('#', '');

export function App() {
  const [activeTab, setActiveTab] = useState<ViewMapKey>(
    (initActiveTab as ViewMapKey) || 'useMutative'
  );

  const activeView = viewMap[activeTab];

  const code = activeView.code;
  const Component = activeView.component;

  useEffect(() => {
    document.location.hash = activeTab;
  }, [activeTab]);

  return (
    <div className="h-full grid grid-cols-12 p-4 pt-6 md:p-12 gap-5">
      <nav className="col-span-full md:col-span-6 lg:col-span-5 md:grid md:grid-rows-2 md:h-full md:overflow-hidden gap-3">
        <div className="flex flex-col justify-end items-center">
          <h1 className="text-4xl sm md:text-5xl lg:text-6xl text-yellow-300 font-bold text-center">
            UseMutative
          </h1>
          <h6 className="text-xl text-gray-200 mt-5">
            Efficient update react state{' '}
            <span className=" font-bold ">immutable</span>
            <br /> with{' '}
            <span className="underline font-bold italic">mutable</span> way.
          </h6>
          <div className="mt-10 md:mt-20 w-96 max-w-full">
            <CodePreview
              code="npm install use-mutative"
              language="bash"
              classes={{
                copyButton: 'mt-2 mr-1',
              }}
            />
          </div>
        </div>

        <div className="p-5 overflow-auto">
          <Component />
        </div>
      </nav>
      <main className="h-screen md:h-auto col-span-full md:col-span-6 lg:col-span-7 overflow-hidden flex flex-col shadow-2xl">
        <ul className="bg-blue-500 rounded-t flex flex-wrap flex-none overflow-hidden">
          {tabs.map((key) => {
            const { title } = viewMap[key];
            return (
              <li
                key={key}
                className={activeTab === key ? activeClassName : undefined}
              >
                <button
                  className="px-4 py-2 focus:outline-none focus:bg-yellow-500/70 hover:bg-yellow-500/70"
                  onClick={() => {
                    setActiveTab(key);
                  }}
                >
                  {title}
                </button>
              </li>
            );
          })}
          <li className="flex-auto" />
          <li className="">
            <a
              title="Go to GitHub"
              className="flex justify-center items-center px-2 text-white h-full text-sm focus:outline-none focus:bg-yellow-500/70 hover:bg-yellow-500/70"
              href="https://github.com/unadlib/use-mutative"
            >
              <GitHub />
            </a>
          </li>
        </ul>
        <CodePreview code={code} classes={{ root: 'flex-auto rounded-b' }} />
      </main>
    </div>
  );
}

export default App;
