import { ChartType } from '../services/api';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function autoSelectChartType(columns: string[], rows: (string | number)[][]): ChartType {
  if (columns.length === 2 && typeof rows[0]?.[1] === 'number') {
    return 'bar';
  }
  if (columns.length === 3 && rows.length > 0 && typeof rows[0]?.[2] === 'number') {
    return 'pie';
  }
  if (columns.length === 2 && rows.length > 1 && typeof rows[0]?.[0] === 'string' && typeof rows[0]?.[1] === 'number') {
    return 'line';
  }
  return 'bar';
}