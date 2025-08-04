import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartOrFallback from './ChartOrFallback';

describe('ChartOrFallback', () => {
  const columns = ['A', 'B'];
  const rows = [ [1, 2], [3, 4] ];

  it('muestra mensaje si no hay datos', () => {
    render(<ChartOrFallback columns={[]} rows={[]} chartType="bar" />);
    expect(screen.getByText(/this question can't be visualized as a chart/i)).toBeInTheDocument();
  });

  it('muestra mensaje si no es graficable', () => {
    render(<ChartOrFallback columns={['A']} rows={[[1]]} chartType="bar" />);
    expect(screen.getByText(/this question can't be visualized as a chart/i)).toBeInTheDocument();
  });

  it('muestra tabla si chartType no es válido', () => {
    render(<ChartOrFallback columns={columns} rows={rows} chartType={"otro" as any} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renderiza correctamente el gráfico de barras', () => {
    const { container } = render(<ChartOrFallback columns={columns} rows={rows} chartType="bar" />);
    expect(container).toBeInTheDocument();
  });
});
