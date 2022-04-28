import { flow, steps } from '@jujulego/flow';
import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';
import jsdoc2md from 'jsdoc-to-markdown';
import { promises as fs } from 'fs';

// Config
const paths = {
  src: 'src/**/*.ts',
  deps: [
    '../../.pnp.*',
  ]
};

const ts = () => typescript.createProject('tsconfig.json')();
const dts = () => typescript.createProject('tsconfig.json', {
  isolatedModules: false,
  emitDeclarationOnly: true
})();

// Steps
const src = (task: string) => steps(
  gulp.src(paths.src, { since: gulp.lastRun(task) }),
  sourcemaps.init(),
);

const dest = (dir: string) => steps(
  sourcemaps.write('.'),
  gulp.dest(dir),
);

// Tasks
gulp.task('clean', () => del('dist'));

gulp.task('build:cjs', () => flow(
  src('build:cjs'),
  ts(),
  babel({ envName: 'cjs' } as Parameters<typeof babel>[0]),
  dest('dist/cjs'),
));

gulp.task('build:esm', () => flow(
  src('build:esm'),
  ts(),
  babel({ envName: 'esm' } as Parameters<typeof babel>[0]),
  dest('dist/esm'),
));

gulp.task('build:types', () => flow(
  src('build:types'),
  dts(),
  dest('dist/types')
));

gulp.task('docs', async () => {
  const docs = await jsdoc2md.render({
    files: './dist/cjs/*.js',
    template: await fs.readFile('./docs/README.hbs', 'utf-8')
  });
  await fs.writeFile('./README.md', docs);
});

gulp.task('build', gulp.parallel('build:cjs', 'build:esm', 'build:types'));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types')
));
