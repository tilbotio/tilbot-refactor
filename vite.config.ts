import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['proj_pub']
    },
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
});
