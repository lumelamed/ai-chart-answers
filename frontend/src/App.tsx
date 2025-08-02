import React, { useState, ChangeEvent, FormEvent } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import axios from 'axios';
import ChartOrFallback from './components/ChartOrFallback';
import { Button } from '@/components/ui/Button';
import { Input } from './components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/Select';

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
      setError(err.response?.data?.detail || 'Error al consultar');
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
      setError('CSV cargado. Ahora puedes hacer preguntas.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al subir CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Mini Nivii</h1>
        <Input type="file" accept=".csv" onChange={handleUpload} className="mb-4 w-72" />
        <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-xl">
          <Input
            className="flex-1"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Haz una pregunta en lenguaje natural..."
            required
          />
          <Select value={chartType} onValueChange={v => setChartType(v as ChartType)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo de gráfico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Barra</SelectItem>
              <SelectItem value="line">Línea</SelectItem>
              <SelectItem value="pie">Torta</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="w-32">
            {loading ? 'Consultando...' : 'Preguntar'}
          </Button>
        </form>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {data && (
          <ChartOrFallback columns={data.columns} rows={data.rows} chartType={chartType} />
        )}
      </div>
    </ThemeProvider>
  );
}
