import qw from 'js-utils/qw';
import gulp from 'gulp';
import lazyReq from 'lazyreq';

const $ = lazyReq(require, {
	newer: 'gulp-newer',
	cached: 'gulp-cached',
	babel: 'gulp-babel',
	eslint: 'gulp-eslint',
	mocha: 'gulp-mocha',
	istanbul: 'gulp-istanbul',
	isparta: 'isparta',
});

gulp.task('build', () =>
	gulp.src('./src/**/*.js')
		.pipe($.newer('./build'))
		.pipe($.babel({
			sourceMaps: 'inline',
		}))
		.pipe(gulp.dest('./build'))
);

gulp.task('lint', () =>
	gulp.src(['./src/**/*.js', './test/**/*.js', './gulpfile.babel.js'])
		.pipe($.cached('lint'))
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.eslint.failAfterError())
);

gulp.task('test', cb => {
	gulp.src(['./src/**/*.js'])
		.pipe($.istanbul({
			instrumenter: $.isparta.Instrumenter,
			includeUntested: true,
		}))
		.pipe($.istanbul.hookRequire())
		.on('finish', () => {
			gulp.src('./test/**/*.js', {read: false})
				.pipe($.mocha())
				.pipe($.istanbul.writeReports())
				.pipe($.istanbul.enforceThresholds({
					thresholds: {global: 90},
				}))
				.on('end', cb);
		});
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*.js', qw('build lint'));
});
