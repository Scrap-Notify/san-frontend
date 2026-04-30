// packages/dashboard/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@san/shared': resolve(__dirname, '../shared/src/index.ts'),
      '@san/ui':     resolve(__dirname, '../ui/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});