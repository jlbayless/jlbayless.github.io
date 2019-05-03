'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nunjucks = require('gulp-nunjucks');
var nunjucksRender = require('gulp-nunjucks-render');
var nunjucksData = require('gulp-nunjucks-data');

// compile scss to css
gulp.task('sass', function () {
    return gulp.src('./sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({basename: 'styles.min'}))
        .pipe(gulp.dest('./css'));
});

// watch changes in scss files and run sass task
gulp.task('sass:watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

// minify js
gulp.task('minify-js', function () {
    return gulp.src('./js/scripts.js')
        .pipe(uglify())
        .pipe(rename({basename: 'scripts.min'}))
        .pipe(gulp.dest('./js'));
});

gulp.task("nunjucks", () =>
  // Gets .html and .njk files in pages
  gulp
    .src("./pages/**/*.+(html|njk)")
    // Adding data to Nunjucks
    // .pipe(
    //   nunjucksData(() => {
    //     return require("./data.json");
    //   })
    // )
    // Renders template with nunjucks
    .pipe(
      nunjucksRender({
        path: ["./templates/"]
      })
    )
    // output files in main folder
    .pipe(gulp.dest("./"))
);

// default task
gulp.task('default', ['sass', 'minify-js', 'nunjucks']);
