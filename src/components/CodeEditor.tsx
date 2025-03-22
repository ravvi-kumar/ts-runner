import { Editor } from '@monaco-editor/react';
import { useRef } from 'react';

interface CodeEditorProps {
  initialValue?: string;
  onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialValue = '', 
  onChange, 
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="relative">
      <div className="h-[500px] w-full overflow-visible shadow-lg">
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
            wordBasedSuggestions: "currentDocument",
            formatOnPaste: true,
            formatOnType: true,
            hover: {
              above: false,
              delay: 300,
              sticky: true
            },
            lineNumbers: 'on',
            roundedSelection: true,
            selectOnLineNumbers: true,
            renderLineHighlight: 'all',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;