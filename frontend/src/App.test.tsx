import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { askQuestion, uploadCSV } from '@/services/api';

vi.mock('@/services/api', () => ({
  askQuestion: vi.fn(),
  uploadCSV: vi.fn(),
}));

const mockResponse = {
  columns: ['A', 'B'],
  rows: [ [1, 2], [3, 4] ]
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza input y botón', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/question/i)).toBeInTheDocument();
    expect(screen.getByText(/ask/i)).toBeInTheDocument();
  });

  it('muestra error si backend falla', async () => {
    (askQuestion as any).mockRejectedValue({ response: { data: { detail: 'Error' } } });
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/question/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/ask/i));
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
  });

  it('muestra gráfico si backend responde', async () => {
    (askQuestion as any).mockResolvedValue(mockResponse);
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/question/i), { target: { value: 'test' } });
    // Cambia el tipo de gráfico a uno inválido para forzar la tabla
    fireEvent.change(screen.getByDisplayValue('Bar'), { target: { value: 'Other' } });
    fireEvent.click(screen.getByText(/ask/i));
    await waitFor(() =>
      expect(screen.getByText('A')).toBeInTheDocument()
    );
  });
});
