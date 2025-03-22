import { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';

function App() {
  const [code, setCode] = useState<string>('// Write your TypeScript code here\nconsole.log("Hello, World!");\n');
  const [outputs, setOutputs] = useState<Array<{ type: 'log' | 'error' | 'info' | 'warn', content: string, timestamp: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);

  const handleRunCode = useCallback(async () => {
    if (!worker) return;

    setIsRunning(true);
    setOutputs([]);
    
    try {
      worker.postMessage({
        type: 'EXECUTE',
        code
      });
    } catch (error) {
      setOutputs([{
        type: 'error',
        content: error instanceof Error ? error.message : 'An error occurred',
        timestamp: Date.now()
      }]);
    }

    // Set a timeout to reset the running state
    setTimeout(() => {
      setIsRunning(false);
    }, 100);
  }, [worker, code]);

  useEffect(() => {
    const codeWorker = new Worker(
      new URL('./workers/code-executor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    codeWorker.onmessage = (event) => {
      if (event.data.type === 'console') {
        setOutputs(prev => [...prev, {
          type: event.data.method,
          content: event.data.args.join(' '),
          timestamp: event.data.timestamp
        }]);
        
        // Reset running state after receiving output
        setIsRunning(false);
      }
    };

    setWorker(codeWorker);

    return () => {
      codeWorker.terminate();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              TypeScript Playground
            </h1>
            <p className="text-gray-400 mt-1">
              Write, execute, and test TypeScript code in real-time
            </p>
          </div>
          <div>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="text-white bg-gradient-to-r from-blue-400 to-teal-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-2">
              <CodeEditor
                initialValue={code}
                onChange={(value) => setCode(value || '')}
              />

          <div className="space-y-4 relative">
            <div className="h-full">
              <div className="flex items-center justify-between mb-4 absolute top-2 right-2">
                {outputs.length > 0 && (
                  <button
                    onClick={() => setOutputs([])}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ConsoleOutput outputs={outputs} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
