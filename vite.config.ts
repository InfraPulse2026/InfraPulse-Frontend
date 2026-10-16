import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (mode === 'production' && env.VITE_DEMO_MODE === 'true')
    throw new Error('Demo fixtures are development-only. Set VITE_DEMO_MODE=false for production.');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: Object.fromEntries(
        ['/api', '/healthz', '/readyz', '/openapi.json'].map((path) => [
          path,
          {
            target: env.BACKEND_URL || 'http://127.0.0.1:8080',
            changeOrigin: false,
          },
        ]),
      ),
    },
    build: { sourcemap: false, chunkSizeWarningLimit: 650 },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: [...configDefaults.exclude, 'e2e/**'],
    },
  };
});
