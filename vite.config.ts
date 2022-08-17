import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemap: 'inline',
        entryFileNames: 'assets/js/[name].js',
      },
    },
  },
});
