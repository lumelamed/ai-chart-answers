import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('axios');
import axios from 'axios';

const mockResponse = {
  columns: ['A', 'B'],
  rows: [ [1, 2], [3, 4] ]
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza input y botón', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/pregunta/i)).toBeInTheDocument();
    expect(screen.getByText(/preguntar/i)).toBeInTheDocument();
  });

  it('muestra error si backend falla', async () => {
    (axios.post as jest.Mock).mockRejectedValue({ response: { data: { detail: 'Error' } } });
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/pregunta/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/preguntar/i));
    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
  });

  it('muestra gráfico si backend responde', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/pregunta/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByText(/preguntar/i));
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
  });
});
