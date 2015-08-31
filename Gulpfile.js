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
      extensions: ['.js', '.jsx'],
      paths: ['src/', 'node_modules/'],
    })
    .transform(babelify)
    .bundle()
    .on('error', function(err) {
      gutil.log(gutil.colors.red(err.message))
      this.emit('end')
    })
    .pipe(source(output.name))
    .pipe(gulp.dest(output.dir))
    .pipe(connect.reload())
}

gulp.task('serve', function () {
  connect.server({
    root: 'gh-pages',
    livereload: true,
    // host: '0.0.0.0',
    port: '8080'
  })
})

gulp.task('es6', function () {
  gulp.src(['src/list.jsx', 'src/list-item.jsx', 'src/index.js'])
    .pipe(babel())
    .pipe(gulp.dest('lib/'))
})

gulp.task('js', function () {
  return runBabelify('src/index.js', { name: 'list.js', dir: 'dist/' })
})

gulp.task('demo', function () {
  return runBabelify('src/demo.jsx', { name: 'demo.js', dir: 'gh-pages/' })
})

gulp.task('watch', function () {
  gulp.watch(['src/*'], ['demo'])
})

gulp.task('publish', ['js', 'es6'])
gulp.task('default', ['watch', 'demo', 'serve'])
