const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const htmlExtend = require('gulp-html-extend');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const isProd = process.env.NODE_ENV === 'prod';
const paths = {
    css: {
        src: 'src/scss/**/*.scss',
        dest: 'dist/css',
    },
    js: {
        src: [
            'src/js/vendor/jquery.min.js',
            'src/js/vendor/bootstrap/util.js',
            'src/js/vendor/bootstrap/collapse.js',
            'src/js/main.js',
        ],
        dest: 'dist/js',
    },
    html: {
        src: 'src/html/**/*',
        dest: 'dist',
    },
    img: {
        src: 'src/img/**/*',
        dest: 'dist/img',
    },
    font: {
        src: 'src/font/**/*',
        dest: 'dist/font',
    },
    ico: {
        src: 'src/*.ico',
        dest: 'dist',
    },
};

function del() {
    return gulp
        .src('dist/*', {
            read: false,
        })
        .pipe(clean());
}

function css() {
    return gulp
        .src(paths.css.src)
        .pipe(plumber())
        .pipe(gulpIf(!isProd, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpIf(!isProd, sourcemaps.write()))
        .pipe(gulpIf(isProd, cleanCSS({ level: { 1: { specialComments: 0 } } })))
        .pipe(gulp.dest(paths.css.dest));
}

function js() {
    return gulp
        .src(paths.js.src)
        .pipe(plumber())
        .pipe(concat('main.js'))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulp.dest(paths.js.dest));
}

function html() {
    return gulp
        .src(paths.html.src)
        .pipe(plumber())
        .pipe(
            htmlExtend({
                annotations: false,
                verbose: false,
            })
        )
        .pipe(gulp.dest(paths.html.dest));
}

function img() {
    return gulp
        .src(paths.img.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.img.dest));
}

function font() {
    return gulp
        .src(paths.font.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.font.dest));
}

function ico() {
    return gulp
        .src(paths.ico.src)
        .pipe(plumber())
        .pipe(gulp.dest(paths.ico.dest));
}

function serve(done) {
    browserSync.init({
        open: true,
        server: 'dist',
    });

    done();
}

function reload(done) {
    browserSync.reload();
    done();
}

function watch() {
    gulp.watch(paths.css.src, gulp.series(css, reload));
    gulp.watch(paths.js.src, gulp.series(js, reload));
    gulp.watch(paths.html.src, gulp.series(html, reload));
    gulp.watch(paths.img.src, gulp.series(img, reload));
    gulp.watch(paths.font.src, gulp.series(font, reload));
}

exports.serve = gulp.parallel(css, js, html, img, font, ico, gulp.parallel(serve, watch));
exports.default = gulp.series(del, css, js, html, img, font, ico);
