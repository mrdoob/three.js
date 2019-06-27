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

// Plugin to convert the dfeault "three_module_js" variable name to THREE.
var threeGlobalPlugin = {

	generateBundle: function ( options, bundle ) {

		for ( var key in bundle ) {

			bundle[ key ].code = bundle[ key ].code.replace( /three_module_js/g, 'THREE' );

		}

	}

};

createOutputFileMap();

// Generate the configs for every merged output and individual file not
// covered in a merged file.
var configs = [];

mergedFiles.forEach( mergedFileInfo => {

	configs.push( createMergedFileConfig( mergedFileInfo ) );

} );

glob.sync( path.join( sourceDir, '**/*.js' ) )
	.forEach( p => {

		if ( ! isLibrary( p ) && ! ( p in fileToOutput ) ) {

			configs.push( createSingleFileConfig( p ) );

		}

	} );

export default configs;

function isLibrary( depPath ) {

	return depPath.indexOf( libsDir ) === 0;

}

// Resolve which global variable to reference for a given depdency. If a dependency is
// a library we assume it comes from "window" otherwise it is expected to be on "THREE".
function resolveGlobalObject( depPath ) {

	if ( isLibrary( depPath ) ) {

		return 'window';

	} else {

		return 'THREE';

	}

}

function resolveDependencyPath( depPath, inputPath ) {

	if ( /three\.module\.js$/.test( depPath ) ) {

		// If importing three.js
		return 'three';

	} else if ( depPath in fileToOutput ) {

		// If the file is included in a merged file
		return path.relative( inputPath, fileToOutput[ depPath ] ) ;

	} else {

		return path.relative( inputPath, depPath );

	}

}

// Generate the map the stores the name of each file to the file it is merged into.
function createOutputFileMap() {

	mergedFiles.forEach( mergedFileInfo => {

		const paths = mergedFileInfo.paths;
		const output = mergedFileInfo.output;
		paths.forEach( depPath => {

			glob.sync( path.join( sourceDir, depPath ) ).forEach( fullPath => {

				fileToOutput[ fullPath ] = path.join( outputDir, output );

			} );

		} );

	} );

}

function createMergedFileConfig( mergedFileInfo ) {

	const inputPath = path.join( sourceDir, mergedFileInfo.input );
	const outputPath = path.join( outputDir, mergedFileInfo.output );
	const internalFiles = [ mergedFileInfo.input, ...mergedFileInfo.paths ].map( p => path.join( sourceDir, p ) );

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
