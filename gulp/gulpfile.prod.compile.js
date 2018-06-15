const debug = require('debug')('draft:prod-compile');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const tasks = require('./tasks');

const dist = 'dist';

gulp.task('clean', () => tasks.clean(dist));

gulp.task('cleanTypes', () => tasks.cleanTypes());

gulp.task('compile', () => tasks.compile(dist, debug, false));

gulp.task('cssCompile', () => tasks.cssCompile(dist, debug));

gulp.task('default', () => {
    runSequence('cleanTypes', 'clean', ['compile', 'cssCompile']);
});
