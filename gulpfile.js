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
  notify = require('gulp-notify');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == "dev";

//just convert .scss files to .css and put them to appropriate folder
gulp.task('scss', () => {
  return gulp.src('app/scss/**/*.scss', {since: gulp.lastRun('scss')})
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(sass())
    .on('error', notify.onError((err) => {
      return {
        title: 'Error in scss',
        message: err.message
      }
    }))
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(gulp.dest('app/css/'));
});

gulp.task('clean', () => del('dist'));

gulp.task('images', () => {
  return gulp.src('app/img/**.*', {since: gulp.lastRun('images')})//only files that have changed since last run
    // .pipe(newer())
    .pipe(gulp.dest('dist/img'));
});

gulp.task('build', gulp.series('clean', gulp.parallel('scss', 'images')));

gulp.task('watch', () => {
  gulp.watch('app/scss/**/*.*', gulp.series('scss'));
  // gulp.watch('app/images/**/*.*', gulp.series('images'));
});

gulp.task('dev', gulp.series('build', 'watch'));

gulp.task('serve', () => {
  browserSync.init({
    server: './app'
  });
  browserSync.watch('app/**/*.*').on('change', browserSync.reload);
});