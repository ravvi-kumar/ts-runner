import { useState, useEffect, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';

function App() {
  const [code, setCode] = useState<string>('// Write your TypeScript code here\nconsole.log("Hello, World!");\n');
  const [outputs, setOutputs] = useState<Array<{ type: 'log' | 'error' | 'info' | 'warn', content: string, timestamp: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);

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
      }
    };

    setWorker(codeWorker);

    return () => {
      codeWorker.terminate();
    };
  }, []);

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
    } finally {
      setIsRunning(false);
    }
  }, [worker, code]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TypeScript Code Runner</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md text-white ${
              isRunning ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
        <CodeEditor
          initialValue={code}
          onChange={(value) => setCode(value || '')}
        />
        <ConsoleOutput outputs={outputs} />
      </div>
    </div>
  );
}

export default App;
