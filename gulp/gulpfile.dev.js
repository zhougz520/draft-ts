const debug = require('debug')('draft:dev-compile');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const tasks = require('./tasks');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const dist = 'dev';

const runDevServer = () => {
    const compileConfig = {
        entry: {
            vendor: [
                'react',
                'react-dom'
            ],
            example: './example/src/example.tsx'
        },
        output: {
            filename: '[name].js',
            publicPath: ''
        },
        devtool: 'source-map',
        plugins: [
            new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')}})
        ],
        resolve: {extensions: ['.ts', '.tsx', '.js', '.json']},
        module: {
            rules: [
                {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
                {test: /\.css$/, use: ['style-loader', 'css-loader']},
                {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'}
            ]
        }
    };

    const compiler = webpack(compileConfig);
    const port = process.env.PORT || 8888;
    const server = new WebpackDevServer(
        compiler,
        {
            publicPath: '/',
            contentBase: './example/static/',
            inline: true
        }
    );

    server.listen(port, '0.0.0.0', () => {
        debug(`🌎  server on http://localhost:${port}`);
    });
}

gulp.task('clean', () => tasks.clean(dist));

gulp.task('compile', () => tasks.compile(dist, debug));

gulp.task('watch', ['compile'], () => {
    runDevServer();

    gulp.watch(tasks.src, () => {
        debug('detecting files changed, recompile');
        tasks.compile(dist, debug);
        debug('recompile complete');
    });
});

gulp.task('default', () => {
    runSequence('clean', 'watch');
});
