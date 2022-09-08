import { defineConfig } from 'vite';
import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [svelte()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        content_script: path.resolve(__dirname, 'src/extension/content_script.ts'),
        helpers: path.resolve(__dirname, 'src/extension/helpers.ts'),
        main: path.resolve(__dirname, 'src/extension/main.ts'),
        background: path.resolve(__dirname, 'src/extension/background.ts'),
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
