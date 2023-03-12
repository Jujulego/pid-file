import { flow, steps } from '@jujulego/flow';

import del from 'del';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';
import jsdoc2md from 'jsdoc-to-markdown';
import fs from 'node:fs/promises';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swc = require('gulp-swc');

// Config
const options = {
  src: 'src/**/*.ts',
  output: 'dist',
  tsconfig: 'tsconfig.json',
  deps: [
    '.pnp.*',
  ]
};

// Steps
export function src(...params: Parameters<typeof gulp.src>) {
  return steps(
    gulp.src(...params),
    sourcemaps.init()
  );
}

export function dest(path: string) {
  return steps(
    sourcemaps.write('.'),
    gulp.dest(path),
  );
}

export function dts(tsconfig: string) {
  const prj = typescript.createProject(tsconfig, {
    isolatedModules: false,
    emitDeclarationOnly: true
  });

  return prj();
}

// Tasks
gulp.task('clean', () => del(options.output));

gulp.task('build:esm', () => flow(
  src(options.src, { since: gulp.lastRun('build:esm') }),
  swc({ module: { type: 'es6' } }),
  dest(path.join(options.output, 'esm'))
));

gulp.task('build:cjs', () => flow(
  src(options.src, { since: gulp.lastRun('build:cjs') }),
  swc({ module: { type: 'commonjs' } }),
  dest(path.join(options.output, 'cjs'))
));

gulp.task('build:types', () => flow(
  src(options.src, { since: gulp.lastRun('build:types') }),
  dts(options.tsconfig),
  dest(path.join(options.output, 'types'))
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));

gulp.task('docs', async () => {
  const docs = await jsdoc2md.render({
    files: './dist/cjs/*.js',
    template: await fs.readFile('./docs/README.hbs', 'utf-8')
  });
  await fs.writeFile('./README.md', docs);
});

gulp.task('watch', () => gulp.watch([options.src, ...options.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));
