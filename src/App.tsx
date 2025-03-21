import { useState } from 'react';
import CodeEditor from './components/CodeEditor';

function App() {
  const [code, setCode] = useState<string>('// Write your TypeScript code here\n\n');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TypeScript Code Runner</h1>
      <div className="grid grid-cols-1 gap-4">
        <CodeEditor
          initialValue={code}
          onChange={(value) => setCode(value || '')}
        />
      </div>
    </div>
  );
}

export default App;
