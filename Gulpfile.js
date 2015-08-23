'use strict'

let gulp = require('gulp')
let connect = require('gulp-connect')
let sourcemaps = require('gulp-sourcemaps')
let browserify = require('browserify')
let babelify = require('babelify')
let babel = require('gulp-babel')
let gutil = require('gulp-util')
let source = require('vinyl-source-stream')

function runBabelify(entries, output) {
  return browserify({
      entries: entries,
      paths: ['src/', 'node_modules/'],
    })
    .transform(babelify)
    .bundle()
    .on('error', err => {
      gutil.log(gutil.colors.red(err.message))
      this.emit('end')
    })
    .pipe(source(output.name))
    .pipe(gulp.dest(output.dir))
    .pipe(connect.reload())
}

gulp.task('serve', () => {
  connect.server({
    root: '.',
    livereload: true
  })
})

gulp.task('es6', () => {
  gulp.src(['src/list.jsx', 'src/list-item.jsx', 'src/index.js'])
    .pipe(babel())
    .pipe(gulp.dest('lib/'))
})

gulp.task('js', () => {
  return runBabelify('src/index.js', { name: 'list.js', dir: 'dist/' })
})

gulp.task('demo', () => {
  return runBabelify('src/demo.jsx', { name: 'demo.js', dir: 'dist/' })
})

gulp.task('watch', () => {
  gulp.watch(['src/*'], ['js'])
})

gulp.task('publish', ['js', 'es6'])
gulp.task('default', ['watch', 'demo', 'serve'])
