import { render, screen, act } from '@testing-library/react';
import { ExplanationStream } from './ExplanationStream';
import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mockea el módulo real usando el alias de tu proyecto
vi.mock('@/services/api', () => ({
  explainResult: vi.fn(),
}));

import { explainResult } from '@/services/api';

describe('ExplanationStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading initially and then renders streamed text', async () => {
    (explainResult as unknown as ReturnType<typeof vi.fn>).mockImplementation(async function* () {
      yield new Promise(res => setTimeout(() => res('Hello '), 30));
      yield new Promise(res => setTimeout(() => res('world!'), 10));
    });

    render(<ExplanationStream columns={['a']} rows={[[1]]} />);

    // Chequea el loading inmediatamente después del render
    expect(
      screen.getByText((content) => content.includes('Generating explanation'))
    ).toBeInTheDocument();

    // Espera el texto final (matcher flexible)
    expect(
      await screen.findByText((content) => content.includes('Hello') && content.includes('world!'))
    ).toBeInTheDocument();
  });

  it('shows error if streaming fails', async () => {
    (explainResult as unknown as ReturnType<typeof vi.fn>).mockImplementation(async function* () {
      throw new Error('fail');
    });

    await act(async () => {
      render(<ExplanationStream columns={['a']} rows={[[1]]} />);
    });
    await act(async () => {
      await new Promise(res => setTimeout(res, 10));
    });
    expect(screen.getByText(/Error streaming explanation/i)).toBeInTheDocument();
  });
});
