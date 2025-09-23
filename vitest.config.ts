import { swc } from '@jujulego/vite-plugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '.vite',
  test: {
    reporters: ['default', 'junit'],
    coverage: {
      include: ['src/**'],
      reporter: ['text', 'lcovonly'],
    },
    outputFile: {
      junit: 'junit-report.xml'
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