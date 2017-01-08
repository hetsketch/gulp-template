'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create(),
  concat = require('gulp-concat'),//files concatination
  uglify = require('gulp-uglifyjs'),//js compression
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  autoprefixer = require('gulp-autoprefixer'),
  gulpIf = require('gulp-if'),
  sourcemaps = require('gulp-sourcemaps'),
  newer = require('gulp-newer'),
  notify = require('gulp-notify'),
  ttf2eot = require('gulp-ttf2eot'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2svg = require('gulp-ttf-svg');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == "dev";

const paths = {
  scss: {
    src: 'app/scss/**/.scss',
    devDest: 'app/css/',
    prodDest: 'dist/css/'
  },
  fonts: {
    src: 'app/fonts/**/.ttf',
    all: 'app/fonts/**/*.*',
    devDest: 'app/fonts/',
    prodDest: 'dist/fonts/'
  },
  images: {
    src: 'app/images/**/*.*',
    dest: 'dist/fonts/'
  },
  js: {
    src: 'app/js/**/*.js',
    dest: 'dist/js/'
  },
  libs: {
    src: 'app/libs/**/*min.js',
    devDest: 'app/js',
    prodDest: 'dist/js/'
  }, 
  app: {
    all: 'app/**/*.*'
  }
};

//just convert .scss files to .css and put them to appropriate folder
gulp.task('scss', () => {
  return gulp.src(paths.scss.src, {since: gulp.lastRun('scss')})
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(sass())
    .on('error', notify.onError((err) => {
      return {
        title: 'Error in scss',
        message: err.message
      };
    }))
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(
      gulpIf(isDev,
        //true
        gulp.dest(paths.scss.devDest),
        //false
        gulp.dest(paths.scss.prodDest))
    );
});

gulp.task('images', () => {
  return gulp.src(paths.images.src, {since: gulp.lastRun('images')})//only files that have changed since last run
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .on('error', notify.onError((err) => {
      return {
        title: 'Error in images',
        message: err.message
      };
    }))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('clean', () => del('dist'));

gulp.task('watch', () => {
  gulp.watch(paths.scss.src, gulp.series('scss'));
  gulp.watch(paths.images.src, gulp.series('images'));
  gulp.watch(paths.fonts.src, gulp.series('fonts:convert'));
});

gulp.task('serve', () => {
  browserSync.init({
    server: './app'
  });
  browserSync.watch(paths.app.all)
    .on('change', browserSync.reload);
});

gulp.task('ttf2eot', () => {
  return gulp.src(paths.fonts.src, {since: gulp.lastRun('ttf2eot')})
    .pipe(ttf2eot())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('ttf2woff', () => {
  return gulp.src(paths.fonts.src, {since: gulp.lastRun('ttf2woff')})
    .pipe(ttf2woff())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('ttf2svg', () => {
  return gulp.src(paths.fonts.src, {since: gulp.lastRun('ttf2svg')})
    .pipe(ttf2svg())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('fonts:convert', gulp.parallel('ttf2eot', 'ttf2woff', 'ttf2svg'));

gulp.task('fonts', gulp.series('fonts:convert', () => {
  return gulp.src(paths.fonts.all)
    .pipe(gulp.dest(paths.fonts.prodDest));
}));

gulp.task('js', () => {
  gulp.src(paths.js.src)
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('libs', () => {
  gulp.src(paths.libs.src)
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(paths.libs.devDest))
    .pipe(gulp.dest(paths.libs.prodDest));
});

gulp.task('dev', gulp.series('scss', 'fonts:convert', gulp.parallel('watch', 'serve')));

gulp.task('build', gulp.series('clean', gulp.parallel('scss', 'images', 'fonts')));