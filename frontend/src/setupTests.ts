import '@testing-library/jest-dom';
// Mock global ResizeObserver para tests de Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ResizeObserver;

// Mock global de offsetWidth/offsetHeight para que Recharts renderice SVG en tests
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });

// Mock window.matchMedia para tests (usado por ThemeProvider)
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
}
