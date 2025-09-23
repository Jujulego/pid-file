import { swc } from '@jujulego/vite-plugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '.vite',
  test: {
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'lcovonly'],
    },
    typecheck: {
      tsconfig: 'tests/tsconfig.json',
    }
  },
  plugins: [
    tsconfigPaths(),
    swc()
  ]
});
