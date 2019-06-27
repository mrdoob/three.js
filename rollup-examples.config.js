var path = require( 'path' );
var glob = require('glob');

var libsDir = path.resolve( 'examples/jsm/libs/' );
var sourceDir = path.resolve( 'examples/jsm/' );
var outputDir = path.resolve( 'examples/js/' );

// How to merge output files.
// "input": Which jsm file to process.
// "output": The name and location to output the resultant UMD file.
// "paths": Which files should be merged into the file. Any other files
// not in the list will be considered external.
var mergedFiles = [{

	input: 'postprocessing/EffectComposer.js',
	output: 'postprocessing/EffectComposer.js',
	paths: [
		'postprocessing/Pass.js',
	]

}];

// A map of processed files to the output file that they have been rolled up
// in so references can be corrected.
var fileToOutput = {};

createOutputFileMap();

// Generate the configs for every merged output and individual file not
// covered in a merged file.
var configs = [];

mergedFiles.forEach( f => {

	configs.push( createMergedFileConfig( f ) );

} );

glob.sync( path.join( sourceDir, '**/*.js' ) )
	.forEach( p => {

		if ( ! ( p in fileToOutput ) ) {

			configs.push( createSingleFileConfig( p ) );

		}

	} );

export default configs;

// Plugin to convert the dfeault "three_module_js" variable name to THREE.
var threeGlobalPlugin = {

	generateBundle: function ( options, bundle ) {

		for ( var key in bundle ) {

			bundle[ key ].code = bundle[ key ].code.replace( /three_module_js/g, 'THREE' );

		}

	}

};

// Resolve which global variable to reference for a given depdency. If a dependency is
// a library we assume it comes from "window" otherwise it is expected to be on "THREE".
function resolveGlobalObject( p ) {

	if ( p.indexOf( libsDir ) === 0 ) {

		return 'window';

	} else {

		return 'THREE';

	}

}

function resolveDependencyPath( p, inputPath ) {

	if ( /three\.module\.js$/.test( p ) ) {

		// If importing three.js
		return 'three';

	} else if ( p in fileToOutput ) {

		return path.relative( inputPath, fileToOutput[ p ] ) ;

	} else {

		return path.relative( inputPath, p );

	}

}

function createOutputFileMap() {

	mergedFiles.forEach( f => {

		const paths = f.paths;
		const output = f.output;
		paths.forEach( p => {

			glob.sync( path.join( sourceDir, p ) ).forEach( fullPath => {

				fileToOutput[ fullPath ] = path.join( outputDir, output );

			} );

		} );

	} );

}

function createMergedFileConfig( f ) {

	const inputPath = path.join( sourceDir, f.input );
	const outputPath = path.join( outputDir, f.output );
	const internalFiles = [ f.input, ...f.paths ].map( p => path.join( sourceDir, p ) );

	return {

		input: inputPath,
		treeshake: false,
		external: p => ! internalFiles.includes( p ),

		plugins: [ threeGlobalPlugin ],

		output: {

			format: 'umd',
			name: 'THREE',
			file: outputPath,
			indent: false,

			globals: p => resolveGlobalObject( p ),
			paths: p => resolveDependencyPath( p, inputPath ),
			extend: true,

			banner:
				'/**\n' +
				` * Generated from '${ path.relative( '.', inputPath ).replace( /\\/g, '/' ) }'\n` +
				' */\n',
			esModule: false

		}

	};

}

function createSingleFileConfig( inputPath ) {

	var relativePath = path.relative( sourceDir, inputPath );
	var outputPath = path.join( outputDir, relativePath );

	return {

		input: inputPath,
		treeshake: false,
		external: p => p !== inputPath,

		plugins: [ threeGlobalPlugin ],

		output: {

			format: 'umd',
			name: 'THREE',
			file: outputPath,
			indent: false,

			globals: p => resolveGlobalObject( p ),
			paths: p => resolveDependencyPath( p, inputPath ),
			extend: true,

			banner:
				'/**\n' +
				` * Generated from '${ path.relative( '.', inputPath ).replace( /\\/g, '/' ) }'\n` +
				' */\n',
			esModule: false

		}

	};

}
