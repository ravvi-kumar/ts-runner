import * as ts from 'typescript';

interface ExecutionMessage {
  type: 'EXECUTE';
  code: string;
}

interface ConsoleMessage {
  type: 'console';
  method: 'log' | 'error' | 'info' | 'warn';
  args: any[];
  timestamp: number;
}

// Create a custom console to capture outputs
const customConsole = {
  log: (...args: any[]) => postConsoleMessage('log', args),
  error: (...args: any[]) => postConsoleMessage('error', args),
  info: (...args: any[]) => postConsoleMessage('info', args),
  warn: (...args: any[]) => postConsoleMessage('warn', args),
};

function postConsoleMessage(method: ConsoleMessage['method'], args: any[]) {
  self.postMessage({
    type: 'console',
    method,
    args: args.map(arg => {
      try {
        // Handle special cases like undefined, functions, etc.
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'function') return arg.toString();
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
      } catch {
        return '[Unserializable value]';
      }
    }),
    timestamp: Date.now()
  } as ConsoleMessage);
}

// Simple TypeScript-like type stripping for now
function transpileTypeScript(code: string): string {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  };

  const result = ts.transpileModule(code, {
    compilerOptions,
    reportDiagnostics: true,
  });

  if (result.diagnostics && result.diagnostics.length > 0) {
    const errors = result.diagnostics
      .map(diagnostic => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        return message;
      })
      .join('\n');
    throw new Error(`TypeScript compilation errors:\n${errors}`);
  }

  return result.outputText;
}

function stripTypeAnnotations(code: string): string {
  try {
    const transpiledCode = transpileTypeScript(code);
    return transpiledCode;
  } catch (error) {
    throw error;
  }
}

function executeInContext(code: string) {
  const context = {
    console: customConsole,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    Promise,
    Error,
    undefined,
    Object,
    Array,
    String,
    Number,
    Boolean,
  };

  const contextKeys = Object.keys(context).join(', ');
  const contextValues = Object.values(context);

  const executor = new Function(contextKeys, `
    'use strict';
    ${code}
  `);

  return executor(...contextValues);
}

self.onmessage = async (event: MessageEvent<ExecutionMessage>) => {
  if (event.data.type === 'EXECUTE') {
    try {
      const jsCode = stripTypeAnnotations(event.data.code);
      await executeInContext(jsCode);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const formattedError = errorMessage.includes('ReferenceError') 
        ? `Runtime Error: ${errorMessage}`
        : `${errorMessage}`;
      postConsoleMessage('error', [formattedError]);
    }
  }
};
