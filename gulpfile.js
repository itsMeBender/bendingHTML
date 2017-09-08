/* GULP
 * I introduced Gulp to solve one thing:
 * To copy the test-data.html file to the '/out/test/' enviroment, 
 * because the test was mangling the html and saving the file.
 * Useless for next test. But the real culprit was the VSC 'Auto save' function.
 * When switched OFF, Gulp wasn't needed any more.
 * 
 * ISSUES
 * - Gulp `sourcemaps` isn't configured correctly, generating wrong linenumbers.
 */

/* global require */

var gulp = require('gulp');
var copyfiles = require('copyfiles');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var tsSourceMaps = ts.createProject('tsconfig.json');
var sourcemaps = require('gulp-sourcemaps');

// Copy fresh test data to test location.
gulp.task('copy-testdata', function(callback) {
    copyfiles(['test/test-data.html', 'out/'], function(e) {});
});

// Compile TypeScript files, using 'tsconfig.json' file.
// https://www.typescriptlang.org/docs/handbook/gulp.html
// https://weblogs.asp.net/dwahlin/creating-a-typescript-workflow-with-gulp
gulp.task('compile', function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('out'));
});

// - Gulp `sourcemaps` isn't configured correctly, generating wrong linenumbers.
gulp.task('sourcemaps', function() {
    return tsSourceMaps.src()
        .pipe(sourcemaps.init())
        .pipe(tsSourceMaps())
        .js.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('out'));
});

// Default Gulp commands
gulp.task('default', ['compile', 'copy-testdata'], function() {
    /* eslint-disable */
    console.log('Gulp finished');
    /* eslint-enable */
});
