// packages/extension/vite.config.ts
// Tailwind v4 방식은 tailwind.config.ts 파일 필요없고 vite.config.ts 파일에서 tailwindcss 플러그인 추가하면 됨. (vite 플러그인)
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
      '@san/shared': resolve(__dirname, '../shared/src'),
      '@san/ui':     resolve(__dirname, '../ui/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});