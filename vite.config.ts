import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  
  server: {
    open: true,
    cors: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});