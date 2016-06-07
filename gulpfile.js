var gulp = require("gulp");
var babel = require("gulp-babel");
var react = require("gulp-react");
var sass = require("gulp-sass");
var less = require("gulp-less");
var uglify = require("gulp-uglify");
var minifycss = require('gulp-minify-css');
var jasmine = require("gulp-jasmine");
var concat = require("gulp-concat");
var browserify = require('gulp-browserify');
var print = require('gulp-print');
var jslint = require('gulp-jshint');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');
var notify = require('gulp-notify');//提示信息
var rename = require('gulp-rename');//文件更名
var runSequence = require('run-sequence');

//任务
const transformSass = "transformSass";
const transformLess = "transformLess";
const test = 'test';
const gulp_clean = 'gulp_clean';
const gulp_minify_css = 'gulp_minify_css';
const gulp_print = 'gulp_print';
const gulp_sourcemaps = 'gulp_sourcemaps';
const gulp_util = 'gulp_util';
const static_sync = 'static_sync';
const static_sync_dev = 'static_sync:dev';
const compile_server = 'compile_server';
const compile_server_dev = 'compile:server:dev';
const build = 'build';
const build_dev = 'build:dev';
const gulp_jshint = 'gulp_jshint';

//配置
var config = {};
config.babel = {
    presets: ['babel-preset-es2015']
};
config.dist = './dist';
config.static = [
    'bin/**/*',
    'public/**/*'
];


// 任务************************************************************************************

// scss变异
gulp.task(transformSass, function () {
    return gulp.src("src/css/*.scss")
        .pipe(print())
        .pipe(sass())
        .pipe(gulp.dest("./dist"))
});

// 检查js
gulp.task('lint', function() {
    return gulp.src('src/*.es6')
        .pipe(print())
        .pipe(jslint())
        .pipe(jslint.reporter('default'))
        .pipe(notify({ message: 'lint task ok' }));
});


// less编译
gulp.task(transformLess, function () {
    return gulp.src("src/css/*.less")
        .pipe(print())
        .pipe(less())
        .pipe(gulp.dest("./dist"))
});


gulp.task(gulp_minify_css,function () {
   return gulp.src('./dist/*.css')
       .pipe(print())
       .pipe(minifycss())
       .pipe(gulp.dest(config.dist))
});

// jasmine测试
gulp.task(test, function () {
    return gulp.src("./test/*.js")
        .pipe(print())
        .pipe(jasmine())
});


//拷贝静态资源
gulp.task(static_sync, function () {
    return gulp.src(config.static, {base: './'})
        .pipe(print())
        .pipe(gulp.dest('./dist'));
});

// 热加载
gulp.task(static_sync_dev, [static_sync], function () {
    util.log('[Sync] starting file watch');
    return watch(config.static, function (obj) {
        if (obj.event === 'change' || obj.event === 'add')
            return gulp.src(obj.path, {base: './'})
                .pipe(print())
                .pipe(gulp.dest(config.dist))
                .pipe(print(function () {
                    return '[Sync] file sync success: ' + obj.path.replace(obj.base, '');
                }));
        else if (obj.event === 'unlink') {
            var distFilePath = obj.path.replace(__dirname, __dirname + '/' + config.dist);
            return gulp.src(distFilePath)
                .pipe(print())
                .pipe(clean())
                .pipe(print(function () {
                    return '[Sync] file remove success: ' + obj.path.replace(obj.base, '');
                }));
        }
    });
});

gulp.task(gulp_clean, function () {
    return gulp.src(config.dist + '/*', {read: false})
        .pipe(print())
        .pipe(clean());
});

// compile server script in production mode
gulp.task(compile_server, function () {
    return gulp.src('src/*.es6', {base: './'})
        .pipe(print())
        .pipe(sourcemaps.init())
        .pipe(react())
        .pipe(babel(config.babel))
        .pipe(sourcemaps.write({includeContent: false, sourceRoot: config.dist}))
        .pipe(browserify())
        .pipe(concat('bundle.js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(config.dist));
});

// compile server script in develop mode, automatic compile script when file change
gulp.task(compile_server_dev, function () {
    config.babel.sourceMaps = true;
    return runSequence(
        compile_server,
        function () {
            util.log('[Babel] starting es6 script watch');
            return watch('**/*.es6', function (obj) {
                if (obj.event === 'change' || obj.event === 'add') {
                    util.log('[Babel] file compiling: ' + obj.path.replace(obj.base, ''));
                    return gulp.src(obj.path, {base: './'})
                        .pipe(print())
                        .pipe(sourcemaps.init())
                        .pipe(babel(config.babel))
                        .on('error', function (err) {
                            util.log('[Babel] compile error: ' + obj.path.replace(obj.base, '') + '\n' + err);
                        })
                        .pipe(sourcemaps.write('.', {sourceRoot: './dist/sourcemaps'}))
                        .pipe(browserify())
                        .pipe(concat('bundle.js'))
                        .pipe(rename({ suffix: '.min' }))
                        .pipe(uglify())
                        .pipe(gulp.dest(config.dist))
                        .on('end', function () {
                            util.log('[Babel] file compiled: ' + obj.path.replace(obj.base, ''));
                        });
                } else if (obj.event === 'unlink') {
                    var distFilePath = obj.path.replace(__dirname, __dirname + '/' + config.dist).replace('.es6', '.js');
                    return gulp.src(distFilePath)
                        .pipe(clean())
                        .pipe(print(function () {
                            return '[Babel] file removed: ' + obj.path.replace(obj.base, '');
                        }));
                }
            });
        }
    );
});


gulp.task(build, function () {
    runSequence(gulp_clean, [static_sync, compile_server, transformSass, transformLess]);
});

gulp.task(build_dev, function () {
    runSequence([ static_sync_dev, compile_server_dev,transformSass, transformLess]);
});

gulp.task('default', ['build']);