var gulp = require("gulp");
var babel = require("gulp-babel");
var react = require("gulp-react");
var sass = require("gulp-sass");
var less = require("gulp-less");
var uglify = require("gulp-uglify");
var jasmine = require("gulp-jasmine");
var concat = require("gulp-concat");


const transformJs = "transformJs";
const transformSass = "transformSass";
const transformLess = "transformLess";
const test = 'test';


//js
gulp.task(transformJs, function () {
    return gulp.src("src/*.js")
        .pipe(react())
        .pipe(babel(
            {
                presets: ["babel-preset-es2015"]
            }
        ))
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./dist"))
});

// scss
gulp.task(transformSass, function () {
    return gulp.src("src/css/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./dist"))
});


// less
gulp.task(transformLess, function () {
    return gulp.src("src/css/*.less")
        .pipe(less())
        .pipe(gulp.dest("./dist"))
});


// jasmine
gulp.task(test, function () {
    return gulp.src("./test/*.js")
        .pipe(jasmine())
});

gulp.task("default", [transformJs, transformSass, transformLess, test], function () {
    console.log("task starting...");
});