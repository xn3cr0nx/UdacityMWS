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