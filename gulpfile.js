const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const clean = require('gulp-clean');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const gulpif = require('gulp-if');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const prod = process.env.NODE_ENV === 'prod';

function del() {
    return gulp
        .src('dist/*', {
            read: false,
        })
        .pipe(clean());
}

function css() {
    return gulp
        .src('src/scss/**/*.scss')
        .pipe(plumber())
        .pipe(gulpif(!prod, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(!prod, sourcemaps.write()))
        .pipe(gulpif(prod, cleancss({ level: { 1: { specialComments: 0 } } })))
        .pipe(gulp.dest('dist/css'));
}

function js() {
    return gulp
        .src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/bootstrap/js/dist/collapse.js',
            'src/js/main.js'
        ])
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(gulpif(prod, uglify()))
        .pipe(gulp.dest('dist/js'));
}

function html() {
    return gulp
        .src('src/html/**/!(_)*.pug')
        .pipe(plumber())
        .pipe(
            pug({
                pretty: true,
                data: {},
            })
        )
        .pipe(gulp.dest('dist'));
}

function img() {
    return gulp.src('src/img/**/*')
        .pipe(plumber())
        .pipe(gulpif(prod, imagemin()))
        .pipe(gulp.dest('dist/img'));
}

function font() {
    return gulp.src('src/font/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('dist/font'));
}

function ico() {
    return gulp.src('src/*.ico')
        .pipe(plumber())
        .pipe(gulp.dest('dist'));
}

function serve(done) {
    browsersync.init({
        open: true,
        server: 'dist',
        notify: false,
    });

    done();
}

function reload(done) {
    browsersync.reload();
    done();
}

function watch() {
    gulp.watch('src/scss/**/*.scss', gulp.series(css, reload));
    gulp.watch('src/js/**/*.js', gulp.series(js, reload));
    gulp.watch('src/html/**/*.pug', gulp.series(html, reload));
    gulp.watch('src/img/**/*', gulp.series(img, reload));
    gulp.watch('src/font/**/*', gulp.series(font, reload));
}

exports.serve = gulp.parallel(css, js, html, img, font, ico, gulp.parallel(serve, watch));
exports.default = gulp.series(del, css, js, html, img, font, ico);
