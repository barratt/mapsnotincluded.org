// vite.config.js
import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
  plugins: [
    commonjs() // Use CommonJS plugin to transform require/module.exports
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'index.js'), // Path to your module entry
      formats: ['es'], // Output format as ESM
      fileName: 'oniworldgen' // The name of your output file
    },
    rollupOptions: {
      external: [], // Define external dependencies if needed
      output: {
        globals: {}
      }
    }
  }
});
