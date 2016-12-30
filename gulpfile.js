'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
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
  sourcemaps = require('gulp-sourcemaps');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == "dev";

//just convert .scss files to .css and put them to appropriate folder
gulp.task('scss', () => {
  return gulp.src('app/scss/**/*.scss')
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(gulp.dest('app/css/'));
});


