import { defineConfig } from 'vite';
import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.ts'),
        background: path.resolve(__dirname, 'src/background.ts'),
        popup: path.resolve(__dirname, 'src/popup/main.ts'),
      },
      output: {
        sourcemap: 'inline',
        entryFileNames: 'assets/js/[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
