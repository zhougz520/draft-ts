const debug = require('debug')('draft:dev-compile');
const gulp = require('gulp');
const tasks = require('./tasks');

const dist = 'dev';
let compileStream = null;

gulp.task('clean', () => tasks.clean(dist));

gulp.task('compile', ['clean'], () => tasks.compile(dist, debug));

gulp.task('default', ['compile'], () => {
    debug('dev mode compiled');
});
