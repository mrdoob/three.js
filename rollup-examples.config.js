/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 */

var path = require( 'path' );
var fs = require( 'fs' );

var srcFolder = __dirname + '/examples/jsm/';
var dstFolder = __dirname + '/examples/js/';

var files = [
	// { path: /postprocessing[\/\\].+\.js$/ },
	// { path: /controls[\/\\].+\.js$/ }
];

// Creates a rollup config object for the given file to
// be converted to umd
function createOutput( inputPath ) {

	var relativePath = path.relative( srcFolder, inputPath );
	var outputPath = path.join( dstFolder, relativePath );

	var banner = [
		'/**',
		` * Generated from original source in "examples/jsm/${ relativePath.replace( /\\/g, '/' ) }".`,
		' * Not intended for editing.',
		' */'
	].join( '\n' );

	// Every import is marked as external so the output is 1-to-1. We
	// assume that that global object should be the THREE object so we
	// replicate the existing behavior.
	return {

		input: inputPath,
		treeshake: false,
		external: p => inputPath !== p,

		plugins: [ {

			generateBundle: function ( options, bundle ) {

				for ( var key in bundle ) {

					bundle[ key ].code = bundle[ key ].code.replace( /three_module_js/g, 'THREE' );

				}

			}

		} ],

		output: {

			format: 'umd',
			name: 'THREE',
			file: outputPath,

			globals: () => 'THREE',
			paths: p => /three\.module\.js$/.test( p ) ? 'three' : p,
			extend: true,

			banner: banner,
			esModule: false

		}

	};

}

// Walk the file structure starting at the given directory and fire
// the callback for every file found.
function walk( dir, cb ) {

	var dirFiles = fs.readdirSync( dir );
	dirFiles.forEach( f => {

		var p = path.join( dir, f );
		var stats = fs.statSync( p );

		if ( stats.isDirectory() ) {

			walk( p, cb );

		} else {

			cb( p );

		}

	} );

}

// Gather up all the files
var configs = [];
walk( srcFolder, function ( p ) {

	for ( var i = 0; i < files.length; i ++ ) {

		var file = files[ i ];
		if ( file.path.test( p ) ) {

			// create a rollup config if the file matches one
			// of the path regex
			configs.push( createOutput( p ) );
			break;

		}

	}

} );

// Create a rollup config for each module.js file
export default configs;
