import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cada pasta em apps/ é uma aplicação independente com o próprio index.html.
const apps = readdirSync(resolve(import.meta.dirname, 'apps'));
const input = Object.fromEntries([
  ['main', resolve(import.meta.dirname, 'index.html')],
  ...apps.map((app) => [app, resolve(import.meta.dirname, 'apps', app, 'index.html')]),
]);

export default defineConfig({
  base: '/trybe-bootcamp-frontend/',
  plugins: [react()],
  build: { rollupOptions: { input } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['apps/**/*.test.{js,jsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['apps/**/*.{js,jsx}'],
      exclude: ['apps/**/main.jsx', 'apps/**/*.test.{js,jsx}'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
