const debug = require('debug')('draft:prod-compile');
const gulp = require('gulp');
const tasks = require('./tasks');

const dist = 'dist';

gulp.task('clean', () => tasks.clean(dist));

gulp.task('compile', ['clean'], () => tasks.compile(dist, debug, false));

gulp.task('default', ['compile'], () => {
    debug('prod mode compiled');
});
