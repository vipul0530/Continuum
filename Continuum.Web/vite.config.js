import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Vite's built-in esbuild plugin only applies JSX parsing to .jsx/.tsx by
    // default. vite:import-analysis runs before @vitejs/plugin-react and fails
    // on raw JSX in .js files. This pre-plugin runs first and pre-transforms
    // all .js files in src/ through esbuild's JSX loader so import-analysis
    // sees valid JS.
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/) || id.includes('node_modules')) return null;
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
          jsxImportSource: 'react',
        });
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',         // tell the dep pre-bundler to parse JSX in .js
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
