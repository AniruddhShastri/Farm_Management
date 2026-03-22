import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // GEMINI_API_KEY has no VITE_ prefix — never exposed to the browser bundle
  const geminiKey = env.GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'recharts': ['recharts'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const params = new URLSearchParams(req.url.split('?')[1] || '');
              const model = params.get('model') || 'gemini-2.5-flash';
              proxyReq.path = `/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            });
          },
        },
      },
    },
  };
});
