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
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const fetchStream = async () => {
      try {
        const reader = await explainResult(columns, rows);
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          if (value) setText(t => t + decoder.decode(value));
          done = doneReading;
        }
        setLoading(false);
        onDone?.();
      } catch (err) {
        setText('[Error streaming explanation]');
        setLoading(false);
      }
    };
    fetchStream();
    return () => controller.abort();
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
