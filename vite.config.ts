import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  
  server: {
    open: true,
    cors: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
});
