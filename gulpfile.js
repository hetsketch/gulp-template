'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/,
  lazy: true,
  camelize: true
});
const del = require('del'),
  browserSync = require('browser-sync'), 
  pngquant = require('imagemin-pngquant');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == "dev";

const paths = {
  scss: {
    src: 'app/scss/**/*.scss',
    devDest: 'app/css/',
    prodDest: 'dist/css/'
  },
  fonts: {
    src: 'app/fonts/**/*.ttf',
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
    devDest: 'app/js',
    prodDest: 'dist/js/'
  },
  libs: {
    src: 'app/libs/**/*.min.js',
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
    .pipe($.if(isDev, $.sourcemaps.init()))
    .pipe($.sass())
    .on('error', $.notify.onError((err) => {
      return {
        title: 'Error in scss',
        message: err.message
      };
    }))
    .pipe($.if(isDev, $.sourcemaps.write()))
    .pipe(
      $.if(isDev,
        //true
        gulp.dest(paths.scss.devDest),
        //false
        gulp.dest(paths.scss.prodDest))
    );
});

gulp.task('images', () => {
  return gulp.src(paths.images.src)
  //only new images pass
    .pipe($.newer(paths.images.dest))
    .pipe($.imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .on('error', $.notify.onError((err) => {
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
    .pipe($.ttf2eot())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('ttf2woff', () => {
  return gulp.src(paths.fonts.src, {since: gulp.lastRun('ttf2woff')})
    .pipe($.ttf2woff())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('ttf2svg', () => {
  return gulp.src(paths.fonts.src, {since: gulp.lastRun('ttf2svg')})
    .pipe($.ttfSvg())
    .pipe(gulp.dest(paths.fonts.devDest));
});

gulp.task('fonts:convert', gulp.parallel('ttf2eot', 'ttf2woff', 'ttf2svg'));

gulp.task('fonts', gulp.series('fonts:convert', () => {
  return gulp.src(paths.fonts.all)
    .pipe(gulp.dest(paths.fonts.prodDest));
}));

gulp.task('js', () => {
  return gulp.src(paths.js.src)
    .pipe($.concat('scripts.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.js.devDest))
    .pipe($.if(!isDev, gulp.dest(paths.js.prodDest)));
});

gulp.task('libs', () => {
  return gulp.src(paths.libs.src)
    .pipe($.concat('libs.min.js'))
    .pipe(gulp.dest(paths.libs.devDest))
    .pipe($.if(!isDev, gulp.dest(paths.libs.prodDest)));
});

gulp.task('dev', gulp.series('scss', 'fonts:convert','libs', 'js', gulp.parallel('watch', 'serve')));

//before run the task, set process.env.NODE_ENV to PROD
gulp.task('prod', gulp.series('clean', gulp.parallel('scss', 'images', 'fonts', 'libs', 'js')));