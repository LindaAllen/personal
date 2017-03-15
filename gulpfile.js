
var gulp = require('gulp'),
    fs = require('fs'),
    s3 = require("gulp-s3-gzip"),
    webserver = require('gulp-webserver'),
    open = require('gulp-open'),
    prettify = require('gulp-prettify'),
    gzip = require('gulp-gzip'),
    imagemin = require('gulp-imagemin'),
    cleanCSS = cleanCSS = require('gulp-clean-css');

var ghPages = require('gulp-gh-pages');
 
gulp.task('pages', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});


gulp.task('prettify', function() {
    gulp.src('src/*.html')
        .pipe(prettify({indent_size: 4}))
        .pipe(gulp.dest('src'))
});

gulp.task('gzip', ['prettify'], function () {
   gulp.src('./src/*.html')
       .pipe(gulp.dest('./build'));
});

gulp.task('optimize_images', function () {
    return gulp.src('./src/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ]
        }))
        .pipe(gulp.dest('./build/images'));
});

gulp.task('minify_css', function () {
    return gulp.src('src/style/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./build/style'));
});

gulp.task('copy_favicon', function () {
    return gulp.src(['src/*.png', 'src/*.ico', 'src/*.svg', 'src/*.json', 'src/*.xml'])
        .pipe(gulp.dest('./build'));     
});

gulp.task('copy_scripts', function () {
    return gulp.src(['src/*.js'])
        .pipe(gulp.dest('./build'));     
});

gulp.task('deploy', ['gzip', 'optimize_images', 'minify_css', 'copy_favicon', 'copy_scripts'], function () {
    var aws = JSON.parse(fs.readFileSync('./aws.json')),
        options = { headers: {'Cache-Control': 'max-age=315360000, no-transform, public'} };
    gulp.src('./build/**', {read: true, dot: true})
        .pipe(s3(aws, options));
});


gulp.task('webserver', function () {
    gulp.src('src')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});