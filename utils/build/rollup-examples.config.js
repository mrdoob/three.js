const path = require( 'path' );
const fs = require( 'fs' );

// Creates a rollup config object for the given file to
// be converted to umd
function createOutput( file, externalFiles ) {

	const jsmRoot = path.resolve( process.cwd(), 'examples/jsm' );
	const inputPath = path.resolve( jsmRoot, file );
	const dirName = path.dirname( inputPath );
	const outputPath = path.resolve( process.cwd(), 'examples/js', file );

	if ( ! fs.existsSync( inputPath ) ) {

		return null;

	}

	// Every import is marked as external so the output is 1-to-1. We
	// assume that that global object should be the THREE object so we
	// replicate the existing behavior.
	return {

		input: inputPath,
		treeshake: false,
		external: p => {

			// Check if this imported file is being built separately and mark it as external if true
			const otherPath = path.resolve( dirName, p ).substring( jsmRoot.length + 1 );
			return externalFiles.includes( otherPath );

		},

		plugins: [ {

			generateBundle: function( options, bundle ) {

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
			paths: p => {

				return /three\.module\.js$/.test( p ) ? 'three' : path.relative( inputPath, p );

			},
			extend: true,

			banner:
				'/**\n' +
				` * Generated from '${ path.relative( '.', inputPath ).replace( /\\/g, '/' ) }'\n` +
				' */\n',
			esModule: false

		}

	};

}

// Walk the file structure starting at the given directory and fire
// the callback for every js file.
function walk( dir, cb ) {

	const files = fs.readdirSync( dir );
	files.forEach( f => {

		const p = path.join( dir, f );
		const stats = fs.statSync( p );
		if ( stats.isDirectory() ) {

			walk( p, cb );

		} else if ( f.endsWith( '.js' ) ) {

			cb( p );

		}

	} );

}

// Gather up all the files
const files = [];
const jsRoot = path.resolve( process.cwd(), 'examples/js' );
walk( jsRoot, p => {

	files.push( p.substring( jsRoot.length + 1 ) );

} );

// Create a rollup config for each module.js file
export default files.map( p => createOutput( p, files ) ).filter( p => ! ! p );
