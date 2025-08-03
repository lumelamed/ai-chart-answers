import React, { useState, ChangeEvent, FormEvent } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import axios from 'axios';
import ChartOrFallback from './components/ChartOrFallback';
import { Button } from '@/components/ui/Button';
import { Input } from './components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/Select';
import { ModeToggle } from './components/ModeToggle';

type ChartType = 'bar' | 'line' | 'pie';

interface AskResponse {
  columns: string[];
  rows: (string | number)[][];
}

export default function App() {
  const [question, setQuestion] = useState<string>('');
  const [data, setData] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<ChartType>('bar');

  const handleAsk = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await axios.post<AskResponse>('/ask', { question });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Query error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/upload_csv', formData);
      setError('CSV loaded. Now you are able to make questions.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error loading CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors">
        <div className="w-full max-w-3xl px-4">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Mini Nivii</h1>

            <Input type="file" accept=".csv" onChange={handleUpload} className="mb-4 w-72" />

            <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-xl">
              <Input
                className="flex-1"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Make a question..."
                required
              />
              <Select value={chartType} onValueChange={v => setChartType(v as ChartType)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading} className="w-32">
                {loading ? 'Querying...' : 'Ask'}
              </Button>
            </form>

            {error && <div className="text-red-600 mb-2">{error}</div>}
            {data && (
              <ChartOrFallback columns={data.columns} rows={data.rows} chartType={chartType} />
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
