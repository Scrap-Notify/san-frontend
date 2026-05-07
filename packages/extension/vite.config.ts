// packages/extension/vite.config.ts
// Tailwind v4 방식은 tailwind.config.ts 파일 필요없고 vite.config.ts 파일에서 tailwindcss 플러그인 추가하면 됨. (vite 플러그인)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; 
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './src/manifest.json';

export default defineConfig({
  server: {
    port: 5183,
    strictPort: true,
    cors: true,      // ✅ 이 줄을 추가하세요! (모든 접속 허용)
    origin: 'http://localhost:5183', // ✅ 출처 명시
    hmr: {
      port: 5183,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
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