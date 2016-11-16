var gulp    = require( 'gulp' );
var pump    = require( 'pump' );
var connect = require( 'gulp-connect' );


gulp.task('runserver', function() {
 
	connect.server( { root: '.', port: 8888 } );

});

 gulp.task( 'default', [ 'runserver' ] );
