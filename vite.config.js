import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('motion')) {
              return 'vendor-framework';
            }
            if (id.includes('hanzi-writer')) {
              return 'vendor-hanzi';
            }
            if (id.includes('lucide-react') || id.includes('canvas-confetti')) {
              return 'vendor-ui';
            }
            return 'vendor-misc';
          }
          if (id.includes('src/data/hsk-words.json')) {
            return 'data-words';
          }
          if (id.includes('src/data/hsk-chars.json')) {
            return 'data-chars';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
