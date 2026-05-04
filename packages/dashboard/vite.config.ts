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
    alias: [
      { find: '@san/shared/utils', replacement: resolve(__dirname, '../shared/src/utils/format.ts') },
      { find: '@san/shared', replacement: resolve(__dirname, '../shared/src/index.ts') },
      { find: '@san/ui', replacement: resolve(__dirname, '../ui/src/index.ts') },
    ],
  },
  server: {
    port: 5173,
  },
});
