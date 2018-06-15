const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const composer = require('gulp-uglify/composer');
const del = require('del');
const merge = require('merge2');

const src = ['./src/**/*.ts', './src/**/*.tsx'];
const css = ['./src/**/*.scss', './src/**/*.sass', './src/**/*.css', './src/**/*.jpg', './src/**/*.png', './src/**/*.gif'];

const clean = dist => del(`./${dist}`);

const cleanTypes = () => del('./@types');

const compile = (dist, debug, dev = true) => {
    debug('compiling...');
    const tsProject = ts.createProject('./tsconfig.json', {declaration: true});
    let result = gulp.src(src);

    // 开发模式下初始化 source map
    if (dev) {
        result = result.pipe(sourcemaps.init());
    }

    result = result.pipe(tsProject());

    let jsStream = null;

    // 开发模式下编写 source map, 产品模式下minify
    if (dev) {
        jsStream = result.js.pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '../src'}));
    } else {
        // jsStream = result.js.pipe(minify());
        jsStream = result.js;
    }

    return merge([
        jsStream.pipe(gulp.dest(`./${dist}`)),
        result.dts.pipe(gulp.dest('./@types'))
    ]);
}

const cssCompile = (dist, debug) => {
    debug('cssCompiling...');

    return (
        gulp.src(css).pipe(gulp.dest(`./${dist}`))
    );
}

module.exports = {
    src,
    css,
    compile,
    cssCompile,
    clean,
    cleanTypes
};
