/**
 * Created by sumedas on 30-Mar-15.
 */
var gulp             = require('gulp'),
    runSequence      = require('run-sequence'),
    clean            = require('del'),
    templateCache    = require('gulp-angular-templatecache'),
    concat           = require('gulp-concat'),
    uglify           = require('gulp-uglify'),
    exec             = require('child_process').exec,
    watch            = require('gulp-watch'),
    less             = require('gulp-less');

gulp.task('clean', function (cb) {
    clean(['src/templates.js', 'dist/*'], cb)
});

gulp.task('build-templates', function () {
    return gulp
        .src('templates/**/*.tpl.html')
        .pipe(templateCache({
            standalone: true,
            module: 'blogEditTemplates'
        }))
        .pipe(gulp.dest('src'));
});

gulp.task('build-less', function () {
    return gulp
        .src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist'));
});

gulp.task('build-src', function () {
    return gulp
        .src(['src/blogedit.js', 'src/blogedit.service.js', 'src/blogedit.directive.js',
            'src/blogedit.controllers.js', 'src/templates.js'])
        .pipe(concat('blogedit.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-bundle', function () {
    return gulp
        .src(['dist/blogedit.js'])
        .pipe(concat('blogedit.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
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
            'dist/blogedit.js'])
        .pipe(concat('blogedit.combo.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-combo-css-bundle', function () {
    return gulp
        .src([
            'bower_components/bootstrap-css-only/css/bootstrap.css',
            'dist/*.css'
        ])
        .pipe(concat('blogedit.combo.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-bundle', function () {
        console.log('gulp tasks done!');
    });
});

gulp.task('combo', function () {
    runSequence('clean', 'build-templates', 'build-less', 'build-src', 'build-combo-bundle', 'build-combo-css-bundle', function () {
        exec('cp C:/Users/sumedas/Meow-BlogEdit/dist/* C:/Users/sumedas/Meow-BlogEdit/public');
        console.log('gulp tasks done!');
    });
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