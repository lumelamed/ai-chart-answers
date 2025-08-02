import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Alert, AlertTitle } from '@/components/ui/Alert';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc0cb'];

type ChartType = 'bar' | 'line' | 'pie';

interface ChartOrFallbackProps {
  columns: string[];
  rows: (string | number)[][];
  chartType: ChartType;
}

function isGraphable(columns: string[], rows: (string | number)[][]): boolean {
  return columns.length >= 2 && rows.length > 0;
}

function toRechartsData(columns: string[], rows: (string | number)[][]) {
  return rows.map((row, i) => {
    const obj: Record<string, string | number> = { idx: i };
    columns.forEach((col, j) => { obj[col] = row[j]; });
    return obj;
  });
}

export default function ChartOrFallback({ columns, rows, chartType }: ChartOrFallbackProps) {
  if (!columns || !rows || columns.length === 0 || rows.length === 0) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>No hay datos para mostrar.</AlertTitle>
      </Alert>
    );
  }
  const data = toRechartsData(columns, rows);
  if (!isGraphable(columns, rows)) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>No se puede graficar este resultado.</AlertTitle>
      </Alert>
    );
  }
  if (chartType === 'bar' && columns.length >= 2) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="idx" />
          <YAxis />
          <Tooltip />
          <Legend />
          {columns.slice(1).map((col, i) => (
            <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (chartType === 'line' && columns.length >= 2) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="idx" />
          <YAxis />
          <Tooltip />
          <Legend />
          {columns.slice(1).map((col, i) => (
            <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }
  if (chartType === 'pie' && columns.length >= 2) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey={columns[1]} nameKey={columns[0]} cx="50%" cy="50%" outerRadius={100} label>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  // Fallback: tabla con shadcn/ui
  return (
    <div className="overflow-x-auto my-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
