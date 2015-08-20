'use strict'

let gulp = require('gulp')
let connect = require('gulp-connect')
let sourcemaps = require('gulp-sourcemaps')
let browserify = require('browserify')
let babelify = require('babelify')
let gutil = require('gulp-util')
let source = require('vinyl-source-stream')

gulp.task('serve', () => {
  connect.server({
    root: '.',
    livereload: true
  })
})

gulp.task('js', () => {
  return browserify({
      entries: 'src/test.jsx',
      paths: ['src/', 'node_modules/'],
    })
    .transform(babelify)
    .bundle()
    .on('error', err => {
      gutil.log(gutil.colors.red(err.message))
      this.emit('end')
    })
    .pipe(source('list.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(connect.reload())
})

gulp.task('watch', () => {
  gulp.watch(['src/*'], ['js'])
})

gulp.task('build', ['js'])
gulp.task('default', ['watch', 'js', 'serve'])
