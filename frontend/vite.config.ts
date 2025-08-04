import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
    preview: {
    host: true,
    port: 5173,
  },
  server: {
    host: true, // equivale a 0.0.0.0
    port: 5173,
    proxy: {
      '/ask': 'http://backend:8000',
      '/explain': 'http://backend:8000',
      '/upload_csv': 'http://backend:8000',
    },
    watch: {
      usePolling: true,
    },
  },
});
