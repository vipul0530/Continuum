import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.js',   // tell Babel plugin to process JSX in .js files
    }),
  ],
  esbuild: {
    loader: 'jsx',          // tell Vite's import-analysis to accept JSX in .js files
    include: /src\/.*\.js$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',       // tell esbuild dep scanner to parse JSX in .js
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7001',
        changeOrigin: true,
        secure: false,        // accept the dev self-signed cert
      },
    },
  },
});
