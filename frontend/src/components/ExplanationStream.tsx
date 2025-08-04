import React, { useEffect, useRef } from 'react';
import { explainResult } from '@/services/api';

interface ExplanationStreamProps {
  columns: string[];
  rows: (string | number)[][];
  onDone?: () => void;
}

export const ExplanationStream: React.FC<ExplanationStreamProps> = ({ columns, rows, onDone }) => {
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setText('');
    setLoading(true);

    // Abort previous request if any
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const fetchStream = async () => {
      try {
        const reader = await explainResult(columns, rows);

        const decoder = new TextDecoder();
        let done = false;
        let buffer = '';

        while (!done) {
          if (controller.signal.aborted) break;

          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            buffer += decoder.decode(value, { stream: true });

            // Para evitar renders excesivos, actualizamos el estado cada 100ms aprox
            if (buffer.length > 50) {
              setText(t => t + buffer);
              buffer = '';
            }
          }
        }

        // Flush remaining buffer
        if (buffer.length > 0) setText(t => t + buffer);

        if (!controller.signal.aborted) {
          setLoading(false);
          onDone?.();
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setText('[Error streaming explanation]');
          setLoading(false);
        }
      }
    };

    fetchStream();

    return () => {
      controller.abort();
    };
  }, [columns, rows]);

  return (
    <div className="w-full bg-muted rounded p-3 mt-4 text-sm font-mono whitespace-pre-wrap min-h-[2.5rem] flex items-center">
      {loading && !text ? (
        <span className="text-muted-foreground animate-pulse">Generating explanation...</span>
      ) : (
        text
      )}
    </div>
  );
};
