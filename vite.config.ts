import './server/loadProjectEnv.mjs';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createApp } from './server/app.mjs';

const apiApp = createApp();

const apiMiddleware: Connect.NextHandleFunction = (req, res, next) => {
  const url = req.url ?? '';
  if (!url.startsWith('/api')) return next();
  apiApp(req, res, next);
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sow-for-fde-api',
      configureServer(server) {
        server.middlewares.use(apiMiddleware);
      },
    },
  ],
  server: {
    port: 5175,
  },
  preview: {
    port: 5175,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3847', changeOrigin: true },
    },
  },
});
