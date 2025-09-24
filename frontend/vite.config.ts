import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

export default defineConfig({
  plugins: [sveltekit()],
  build: { minify: false },
  server: {
    host: true,
    allowedHosts: true,
    // port: 5173,
    // strictPort: true,
    fs: {
      allow: ['proj_pub']
    },
    proxy: {
      '/ws': API_URL.replace(/^http(s?):/, 'ws$1:'),
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
});
