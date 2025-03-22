import React, { useRef, useEffect } from 'react';

interface ConsoleOutput {
  type: 'log' | 'error' | 'info' | 'warn';
  content: string;
  timestamp: number;
}

interface ConsoleOutputProps {
  outputs: ConsoleOutput[];
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ outputs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [outputs]);

  const getOutputStyle = (type: ConsoleOutput['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-500 before:content-["✖"]';
      case 'warn':
        return 'text-yellow-500 before:content-["⚠"]';
      case 'info':
        return 'text-blue-500 before:content-["ℹ"]';
      default:
        return 'text-gray-200 before:content-["›"]';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div 
      ref={containerRef}
      className="bg-[#1e1e1e] text-white p-4 rounded-lg h-[300px] overflow-y-auto font-mono text-sm"
    >
      <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
        <span className="text-gray-400">Console</span>
      </div>
      {outputs.length === 0 ? (
        <div className="text-gray-500 italic">No output</div>
      ) : (
        outputs.map((output, index) => (
          <div 
            key={output.timestamp + index} 
            className={`${getOutputStyle(output.type)} flex items-start gap-2 mb-1 group`}
          >
            <span className="text-gray-500 text-xs min-w-[70px]">
              {formatTimestamp(output.timestamp)}
            </span>
            <span className="before:mr-2 before:text-gray-500 text-xs">
              {output.content}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default ConsoleOutput; 