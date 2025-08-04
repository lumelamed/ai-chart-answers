import axios from 'axios';

export type ChartType = 'bar' | 'line' | 'pie';

export interface AskResponse {
  columns: string[];
  rows: (string | number)[][];
}

export const askQuestion = async (question: string): Promise<AskResponse> => {
  const res = await axios.post<AskResponse>('/ask', { question });
  return res.data;
};

export const uploadCSV = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post('/upload_csv', formData);
};

export const explainResult = async (columns: string[], rows: (string | number)[][]): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
const res = await fetch('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns, rows }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  if (!res.body) {
    throw new Error('No response body');
  }
  return res.body.getReader();
};