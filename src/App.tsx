import { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import { executeCode } from './services/codeExecutor';

function App() {
  const [code, setCode] = useState<string>('// Write your TypeScript code here\nconsole.log("Hello, World!");\n');
  const [outputs, setOutputs] = useState<Array<{ type: 'log' | 'error' | 'info' | 'warn', content: string, timestamp: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutputs([]);
    
    try {
      const results = await executeCode(code);
      setOutputs(results);
    } catch (error) {
      setOutputs([{
        type: 'error',
        content: error instanceof Error ? error.message : 'An error occurred',
        timestamp: Date.now()
      }]);
    } finally {
      setIsRunning(false);
    }
  };

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
