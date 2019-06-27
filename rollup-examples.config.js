var path = require( 'path' );
var glob = require('glob');

var sourceDir = path.resolve( 'examples/jsm/' );
var outputDir = path.resolve( 'examples/js/' );

var mergedFiles = [{

	paths: [
		'postprocessing/Pass.js',
	],
	input: 'postprocessing/EffectComposer.js',
	output: 'postprocessing/EffectComposer.js'

}, {

	paths: [
		'nodes/**/*.js'
	],
	input: 'nodes/Nodes.js',
	output: 'nodes/Nodes.js'

}];

var fileToOutput = {};

const threeGlobalPlugin = {

	generateBundle: function ( options, bundle ) {

		for ( var key in bundle ) {

			bundle[ key ].code = bundle[ key ].code.replace( /three_module_js/g, 'THREE' );

		}

	}

};

function resolveDependencyPath( p ) {

	if ( /three\.module\.js$/.test( p ) ) {

		return 'three';

	} else if ( p in fileToOutput ) {

		return fileToOutput[ p ];

	} else {

		return p;

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

			globals: () => 'THREE',
			paths: p => resolveDependencyPath( p ),
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

			globals: () => 'THREE',
			paths: p => resolveDependencyPath( p ),
			extend: true,

			banner:
				'/**\n' +
				` * Generated from '${ path.relative( '.', inputPath ).replace( /\\/g, '/' ) }'\n` +
				' */\n',
			esModule: false

		}

	};

}

createOutputFileMap();

var configs = mergedFiles.map( f => createMergedFileConfig( f ) );
glob.sync( path.join( sourceDir, '**/*.js' ) )
	.forEach( p => {

		if ( ! ( p in fileToOutput ) ) {

			configs.push( createSingleFileConfig( p ) );

		}

	} );

export default configs;
