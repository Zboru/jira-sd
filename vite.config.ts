import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.ts'),
        background: path.resolve(__dirname, 'src/background.ts'),
      },
      output: {
        sourcemap: 'inline',
        entryFileNames: 'assets/js/[name].js',
      },
    },
  },
});
