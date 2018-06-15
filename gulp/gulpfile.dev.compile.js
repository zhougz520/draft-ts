const debug = require('debug')('draft:dev-compile');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const tasks = require('./tasks');

const dist = 'dev';
let compileStream = null;

gulp.task('clean', () => tasks.clean(dist));

gulp.task('cleanTypes', () => tasks.cleanTypes());

gulp.task('compile', () => tasks.compile(dist, debug));

gulp.task('cssCompile', () => tasks.cssCompile(dist, debug));

gulp.task('default', () => {
    runSequence('cleanTypes', 'clean', ['compile', 'cssCompile']);
});
