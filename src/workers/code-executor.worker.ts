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
function stripTypeAnnotations(code: string): string {
  try {
    // Basic transformation to handle async/await
    return `
      (async () => {
        try {
          ${code}
        } catch (error) {
          console.error(error);
        }
      })();
    `;
  } catch (error) {
    console.error('Error transforming code:', error);
    return code;
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
  };

  const contextKeys = Object.keys(context).join(', ');
  const contextValues = Object.values(context);

  // Create a new function with the context variables as parameters
  const executor = new Function(contextKeys, `
    'use strict';
    try {
      return (async () => { 
        ${code}
      })();
    } catch (error) {
      console.error(error);
    }
  `);

  return executor(...contextValues);
}

self.onmessage = async (event: MessageEvent<ExecutionMessage>) => {
  if (event.data.type === 'EXECUTE') {
    try {
      const jsCode = stripTypeAnnotations(event.data.code);
      await executeInContext(jsCode);
    } catch (error) {
      postConsoleMessage('error', [error instanceof Error ? error.message : String(error)]);
    }
  }
};