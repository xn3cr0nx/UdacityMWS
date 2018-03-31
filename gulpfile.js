'use strict';

const gulp         = require('gulp');
const notify       = require('gulp-notify');
const imageResize  = require('gulp-image-resize');
const imagemin     = require('gulp-imagemin');
const rename       = require("gulp-rename");
const changed      = require("gulp-changed");
const glob         = require('glob');
const util         = require('gulp-util');
const gulpif       = require('gulp-if');
const merge2       = require('merge2');

// Background images
const bg_src = 'img/*.jpg';
const bg_dest = 'img/resp/';
const imops = {progressive: true, optimizationLevel: 5};
const formats = [
  {suffix: '-original', width: null},
  {suffix: '-large@3',  width: 1300 * 3},
  {suffix: '-large@2',  width: 1300 * 2},
  {suffix: '-large',    width: 1300},
  {suffix: '-medium@3', width: 700 * 3},
  {suffix: '-medium@2', width: 700 * 2},
  {suffix: '-medium',   width: 700},
  {suffix: '-small@3',  width: 400 * 3},
  {suffix: '-small@2',  width: 400 * 2},
  {suffix: '-small',    width: 400}
];
gulp.task('backgrounds', function(callback) {
  const path = require('path');
  const files = glob.sync(bg_src);
  var streams = [];

  files.map(function(file) {
    let oldname = path.basename(file, '.jpg');
    formats.map(function(format) {
      streams.push(gulp.src(file)
                   .pipe(rename(function (path) {
                     path.basename = oldname + format.suffix;
                   }))
                   .pipe(changed(bg_dest)) // Do not process already done imeges
                   .pipe(gulpif(format.width !== null, imageResize({ width : format.width })))
                   .pipe(imagemin(imops))
                   .pipe(gulp.dest(bg_dest)));
    });
  });
  return merge2(streams);
});
gulp.task( 'default', [ 'backgrounds' ] );


// 'use strict';
// const gulp = require('gulp');
// const gutil = require('gulp-util');
// const del = require('del');
// const debug = require('gulp-debug');
// const $ = require('gulp-load-plugins')();

// gulp.task('clean:output', function() {
//     gutil.log('Deleting /output/**/*', gutil.colors.magenta('123'));
//     return del([
//         'output/**/*'
//     ]);
// });
// gulp.task('build:source', ['clean:output'], function() {
//     gutil.log('Build from /Source', gutil.colors.magenta('123'));
//     return gulp.src(['Source/**/*'])
//     .pipe(debug({title: 'Source:'}))
//     .pipe(gulp.dest('output'));
// });

// gulp.task('build:responsive', ['build:source'], function() {
//     // return gulp.src(['output/**/*.{gif,jpg,jpeg,png}'])
//     return gulp.src(['output/**/*.jpg'])
//     .pipe($.cached('responsive'))
//     .pipe($.responsive({
//         '**/*': [{
//             width: 2240,
//             height: 320,
//             crop: 'center',
//             rename: { suffix: '-thumbwide' }
//         }, {
//             width: 2240,
//             rename: { suffix: '-2240' }
//         }, {
//             width: 1920,
//             rename: { suffix: '-1920' }
//         }, {
//             width: 1600,
//             rename: { suffix: '-1600' }
//         }, {
//             width: 1280,
//             rename: { suffix: '-1280' }
//         }, {
//             width: 960,
//             rename: { suffix: '-960' }
//         }, {
//             width: 640,
//             rename: { suffix: '-640' }
//         }, {
//             width: 480,
//             rename: { suffix: '-480' }
//         }, {
//             width: 320,
//             rename: { suffix: '-320' }
//         }, {
//             width: 160,
//             rename: { suffix: '-160' }
//         }],
//     }, {
//         quality: 70,
//         progressive: true,
//         withMetadata: false,
//         skipOnEnlargement: true,
//         errorOnUnusedConfig: false,
//         errorOnUnusedImage: false,
//         errorOnEnlargement: false
//     }))
//     .pipe(gulp.dest('responsive'))
// });
// gulp.task('build:images', ['build:responsive'], function() {
//     gutil.log('Copying responsive images from /responsive to /output', gutil.colors.magenta('123'));
//     // return gulp.src('responsive/**/*.{gif,jpg,jpeg,png}')
//     return gulp.src('responsive/**/*.jpg')
//     .pipe(debug({title: 'Images:'}))
//     .pipe($.imagemin({
//         progressive: true,
//         interlaced: true
//     }))
//     .pipe(gulp.dest('output'))
// });
// gulp.task('clean:responsive', ['build:images'], function() {
//     gutil.log('Deleting /responsive/**/*', gutil.colors.magenta('123'));
//     return del([
//         'responsive/**/*'
//     ]);
// });
// gulp.task( 'default', [ 'clean:responsive' ] );