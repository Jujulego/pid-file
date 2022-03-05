import { flow, steps } from '@jujulego/flow';
import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import ts from 'gulp-typescript';

// Config
const paths = {
  src: 'src/**/*.ts',
  deps: [
    '../../.pnp.*',
  ]
};

const tsProject = ts.createProject('tsconfig.json', {
  isolatedModules: false,
  declaration: true,
  emitDeclarationOnly: true
});

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
  babel({ envName: 'cjs' } as Parameters<typeof babel>[0]),
  dest('dist/cjs'),
));

gulp.task('build:esm', () => flow(
  src('build:esm'),
  babel({ envName: 'esm' } as Parameters<typeof babel>[0]),
  dest('dist/esm'),
));

gulp.task('build:types', () => flow(
  src('build:types'),
  tsProject(),
  dest('dist/types')
));

gulp.task('build', gulp.parallel('build:cjs', 'build:esm', 'build:types'));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types')
));
