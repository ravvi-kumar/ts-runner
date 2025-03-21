import * as ts from 'typescript';

type ConsoleMethod = 'log' | 'error' | 'info' | 'warn';

interface ExecutionResult {
  type: ConsoleMethod;
  content: string;
  timestamp: number;
}

const createSandboxedEval = () => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const sandboxWindow = iframe.contentWindow;
  if (!sandboxWindow) throw new Error('Failed to create sandbox');
  
  // Create a fresh console in the sandbox
  const consoleProxy = Object.create(null);
  const methods: ConsoleMethod[] = ['log', 'error', 'info', 'warn'];
  methods.forEach(method => {
    consoleProxy[method] = sandboxWindow.console[method].bind(sandboxWindow.console);
  });

  return {
    evaluate: (code: string) => {
      try {
        // Use Function instead of eval for better scope control
        return new sandboxWindow.Function(
          'console',
          `"use strict";\n${code}`
        );
      } catch (error) {
        throw new Error(`Compilation error: ${error.message}`);
      }
    },
    cleanup: () => {
      document.body.removeChild(iframe);
    }
  };
};

export const executeCode = async (code: string): Promise<ExecutionResult[]> => {
  const outputs: ExecutionResult[] = [];
  const sandbox = createSandboxedEval();
  
  try {
    // Transpile TypeScript to JavaScript
    const jsCode = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.None,
        removeComments: true,
        strict: false
      }
    }).outputText;

    // Create wrapped console
    const consoleWrapper = {
      log: (...args: any[]) => captureOutput('log', args),
      error: (...args: any[]) => captureOutput('error', args),
      info: (...args: any[]) => captureOutput('info', args),
      warn: (...args: any[]) => captureOutput('warn', args),
    };

    const evaluator = sandbox.evaluate(jsCode);
    await evaluator.call(sandbox, consoleWrapper);

  } catch (error) {
    outputs.push({
      type: 'error',
      content: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  } finally {
    sandbox.cleanup();
  }

  return outputs;

  function captureOutput(type: ConsoleMethod, args: any[]) {
    outputs.push({
      type,
      content: args.map(arg => {
        try {
          return typeof arg === 'object' ? 
            JSON.stringify(arg, null, 2) : 
            String(arg);
        } catch {
          return '[Unserializable value]';
        }
      }).join(' '),
      timestamp: Date.now()
    });
  }
};