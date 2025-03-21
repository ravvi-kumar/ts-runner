import { Editor } from '@monaco-editor/react';
import { useRef } from 'react';
import { formatCode } from '../services/codeFormatter';

interface CodeEditorProps {
  initialValue?: string;
  onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue = '', onChange }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleFormat = async () => {
    if (editorRef.current) {
      const unformatted = editorRef.current.getValue();
      const formatted = await formatCode(unformatted);
      editorRef.current.setValue(formatted);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleFormat}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded p-2 flex items-center gap-1"
          title="Format Code (Alt+Shift+F)"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
      <div className="h-[500px] w-full border border-gray-700 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={initialValue}
          theme="vs-dark"
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 2,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordBasedSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor; 