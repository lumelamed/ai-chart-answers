import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { autoSelectChartType } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { askQuestion, uploadCSV, ChartType, AskResponse } from '@/services/api';
import ChartOrFallback from '@/components/ChartOrFallback';
import { ExplanationStream } from '@/components/ExplanationStream';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { ModeToggle } from './components/ModeToggle';
import { Alert, AlertTitle, AlertDescription } from './components/ui/Alert';
import { CheckCircle } from 'lucide-react';


export default function App() {
  const [question, setQuestion] = useState<string>('');
  const [data, setData] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [csvLoaded, setCsvLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    if (data) {
      setChartType(autoSelectChartType(data.columns, data.rows));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleAsk = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setData(null);
    try {
      const data = await askQuestion(question);
      setData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Query error');
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
      await uploadCSV(file);
      setSuccess('CSV loaded. Now you are able to make questions.');
      setCsvLoaded(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error loading CSV');
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

            <div className="flex items-center mb-4 gap-2">
              <h1 className="text-2xl font-bold">Mini</h1>
              <img src="/nivi-logo.png" alt="nivi logo" className="h-8 w-8 object-contain" />
            </div>

            <Input type="file" accept=".csv" onChange={handleUpload} className="mb-4 w-72" />

            {!csvLoaded && (
              <Alert className="mb-4">
                <AlertTitle>Upload a CSV file to start</AlertTitle>
                <AlertDescription>
                  Please upload a CSV file first. The question form will be enabled once the data is loaded.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-xl">
              <Input
                className="flex-1"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Make a question..."
                required
                disabled={!csvLoaded}
              />
              <Select value={chartType} onValueChange={v => setChartType(v as ChartType)} disabled={!csvLoaded}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading || !csvLoaded} className="w-32">
                {loading ? 'Querying...' : 'Ask'}
              </Button>
            </form>

            {success && (
              <Alert className="mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {data && (
              <>
                <ChartOrFallback columns={data.columns} rows={data.rows} chartType={chartType} />
                <ExplanationStream columns={data.columns} rows={data.rows} />
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
