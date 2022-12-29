import { CodePreview } from './components/CodePreview';
import { UseMutativeExample } from './use-mutative-example';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import useMutativeExampleCode from './use-mutative-example?raw';
// import { UseMutativeReducerExample } from './use-mutative-reducer-example';
// import { UseMutativeWithPatchesExample } from './use-mutative-with-patches-example';

export function App() {
  return (
    <div className="h-full grid grid-cols-12 p-12 gap-5">
      <nav className="col-span-full md:col-span-6 lg:col-span-5 flex flex-col">
        <div className='flex-auto flex flex-col justify-end items-center'>
          <h1 className="text-6xl text-yellow-300 font-bold text-center">
            UseMutative
          </h1>
          <h6 className="text-xl text-gray-200 mt-5">
            Efficient update react state{' '}
            <span className=" font-bold ">immutable</span>
            <br /> with{' '}
            <span className="underline font-bold italic">mutable</span> way.
          </h6>
        </div>

        <div className="p-5 flex justify-center items-center flex-auto">
          <UseMutativeExample />
          {/* <UseMutativeReducerExample />
        <UseMutativeWithPatchesExample /> */}
        </div>
      </nav>
      <main className="col-span-full md:col-span-6 lg:col-span-7 flex flex-col items-center justify-center overflow-hidden">
        <div className="mt-4 w-full overflow-auto [&>pre]:!m-0 flex-auto">
          <CodePreview code={useMutativeExampleCode} />
        </div>
      </main>
    </div>
  );
}

export default App;
