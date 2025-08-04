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

// Detecta la primera columna categórica (string o no número) para usar como categoría
function findCategoryColumn(columns: string[], rows: (string | number)[][]): string | null {
  for (let j = 0; j < columns.length; j++) {
    const val = rows[0]?.[j];
    if (typeof val === 'string') return columns[j];
    if (typeof val === 'number' && !Number.isFinite(val)) return columns[j];
  }
  return null;
}

// Detecta columnas numéricas
function findNumericColumns(columns: string[], rows: (string | number)[][]): string[] {
  const numericCols: string[] = [];
  for (let j = 0; j < columns.length; j++) {
    const val = rows[0]?.[j];
    if (typeof val === 'number' || !isNaN(Number(val))) {
      numericCols.push(columns[j]);
    }
  }
  return numericCols;
}

function toRechartsData(columns: string[], rows: (string | number)[][]) {
  return rows.map(row => {
    const obj: Record<string, string | number> = {};
    columns.forEach((col, j) => {
      let val = row[j];
      if (typeof val === 'string' && !isNaN(Number(val))) {
        val = Number(val);
      }
      obj[col] = val;
    });
    return obj;
  });
}

function isGraphable(columns: string[], rows: (string | number)[][]): boolean {
  if (columns.length < 2 || rows.length === 0) return false;
  const numericCols = findNumericColumns(columns, rows);
  return numericCols.length > 0;
}

export default function ChartOrFallback({ columns, rows, chartType }: ChartOrFallbackProps) {
  if (!columns || !rows || columns.length === 0 || rows.length === 0) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>This question can't be visualized as a chart. Remember to ask for numeric results.</AlertTitle>
      </Alert>
    );
  }

  if (!isGraphable(columns, rows)) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>This question can't be visualized as a chart. Remember to ask for numeric results.</AlertTitle>
      </Alert>
    );
  }

  const data = toRechartsData(columns, rows);

  const categoryColumn = findCategoryColumn(columns, rows) ?? columns[0];
  const numericColumns = findNumericColumns(columns, rows).filter(col => col !== categoryColumn);

  if (numericColumns.length === 0) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>No numeric columns to visualize.</AlertTitle>
      </Alert>
    );
  }

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryColumn} />
          <YAxis />
          <Tooltip />
          <Legend />
          {numericColumns.map((col, i) => (
            <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={categoryColumn} />
          <YAxis />
          <Tooltip />
          <Legend />
          {numericColumns.map((col, i) => (
            <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    // Pie usa la primera numérica y la categoría
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={numericColumns[0]}
            nameKey={categoryColumn}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
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

  // fallback tabla
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
