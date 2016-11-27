'use strict';

var gulp = require('gulp'),
	wiredep = require('wiredep').stream,
  prefix = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
	browserSync = require('browser-sync').create(),
	useref = require('gulp-useref'),
	uglify = require('gulp-uglify'),
	gulpIf = require('gulp-if'),
	cssnano = require('gulp-cssnano'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence');

gulp.task('hello', function() {
  console.log('Hello, World!');
});

/**
 * Wire Bower dependencies to your source code
 */
gulp.task('bower', function () {
  gulp.src('./app/*.html')
    .pipe(wiredep({
      directory : "app/assets/bower_components"
    }))
    .pipe(gulp.dest('./app'));
});

gulp.task('sass', function() {
  return gulp.src('app/assets/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/assets/scss/**/*.scss', ['sass']);
  gulp.watch('bower.json', ['bower'], browserSync.reload); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload); 
  gulp.watch('app/assets/js/**/*.js', browserSync.reload); 
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

/**
 * Combine + minify CSS and JS
 */
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

/**
 * Minify PNG, JPEG, GIF and SVG images
 */
gulp.task('images', function(){
  return gulp.src('app/assets/images/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/assets/images'))
});

/**
 * Copying Fonts to /dist
 */
gulp.task('fonts', function() {
  return gulp.src('app/assets/fonts/**/*')
  .pipe(gulp.dest('dist/assets/fonts'))
});

/**
 * Cleaning up generated files automatically
 */
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
});

/**
 * Bild project to ./dist
 */
gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['bower', 'sass', 'images', 'fonts'], 'useref',
    callback
  )
});

/**
 * Start project at server
 */
gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
});
