/**
 * Created by sumedas on 30-Mar-15.
 */

require('shelljs/global');

var gulp             = require('gulp'),
    runSequence      = require('run-sequence'),
    clean            = require('del'),
    templateCache    = require('gulp-angular-templatecache'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    minifyCss        = require('gulp-minify-css'),
    minifyHTML       = require('gulp-minify-html'),
    rename           = require('gulp-rename'),
    watch            = require('gulp-watch'),
    less             = require('gulp-less');

gulp.task('clean', function (cb) {
    clean(['dev_dump/*', 'dist/*'], cb)
});

gulp.task('build-templates', function () {
    return gulp
        .src('templates/**/*.tpl.html')
        .pipe(minifyHTML({
            empty: true,
            quotes: true,
            loose: true
        }))
        .pipe(templateCache({
            standalone: true,
            module: 'blogEditTemplates'
        }))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-less', function () {
    return gulp
        .src('less/*.less')
        .pipe(less())
        .pipe(concat('blogedit.css'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-src', function () {
    return gulp
        .src(['src/blogedit.js', 'src/blogedit.service.js', 'src/blogedit.directive.js',
            'src/blogedit.controllers.js', 'dev_dump/templates.js'])
        .pipe(concat('blogedit.js'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-combo-bundle', function () {
    return gulp
        .src([
            'bower_components/js-yaml/dist/js-yaml.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/marked/lib/marked.js',
            'bower_components/angular-marked/angular-marked.min.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-morph/dist/angular-morph.js',
            'dev_dump/blogedit.js'])
        .pipe(concat('blogedit.combo.js'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('build-combo-css-bundle', function () {
    return gulp
        .src([
            'bower_components/bootstrap-css-only/css/bootstrap.css',
            'dev_dump/*.css'
        ])
        .pipe(concat('blogedit.combo.css'))
        .pipe(gulp.dest('dev_dump'));
});

gulp.task('minify-js', function () {
    return gulp
        .src(['dev_dump/blogedit.combo.js', 'dev_dump/blogedit.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function () {
    return gulp
        .src(['dev_dump/blogedit.combo.css', 'dev_dump/blogedit.css'])
        .pipe(minifyCss())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-all', function () {
    runSequence('minify-js', 'minify-css', function () {
        mkdir('-p', './dist/fonts');
        cp('./bower_components/bootstrap-css-only/fonts/*', './dist/fonts');
        console.log('minification done!');
    });
});

gulp.task('combo', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-combo-bundle', 'build-combo-css-bundle', 'minify-all');
});

gulp.task('combo-watch', function () {
    watch('src/blogedit*.js', function () {
        gulp.run('combo');
    });
    watch('templates/*', function () {
        gulp.run('combo');
    });
});

gulp.task('watch', function () {
    watch('src/blogedit*.js', function () {
        gulp.run('default');
    });
    watch('templates/*', function () {
        gulp.run('default');
    });
});