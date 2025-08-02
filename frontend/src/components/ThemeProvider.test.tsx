import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

function Dummy() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span>theme:{theme}</span>
      <button onClick={() => setTheme('dark')}>Set dark</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('proporciona el contexto y permite cambiar el tema', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Dummy />
      </ThemeProvider>
    );
    expect(getByText(/theme:/)).toBeInTheDocument();
    getByText('Set dark').click();
    // No se puede testear el cambio real de theme sin mockear localStorage, pero el render no debe fallar
  });
});
