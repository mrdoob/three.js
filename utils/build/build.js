var fs = require("fs");
var path = require("path");
var argparse =  require( "argparse" );
var random = require('temp-path');
var ClosureCompiler = require('google-closure-compiler').compiler;


function main() {

	"use strict";

	var startTime = Date.now();

	var parser = new argparse.ArgumentParser();
	parser.addArgument( ['--include'], { action: 'append', required: true } );
	parser.addArgument( ['--externs'], { action: 'append', defaultValue: ['./externs/common.js'] } );
	parser.addArgument( ['--amd'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--minify'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--output'], { defaultValue: '../../build/three.js' } );
	parser.addArgument( ['--sourcemaps'], { action: 'storeTrue', defaultValue: true } );


	var args = parser.parseArgs();

	var output = args.output;
	console.log('Building ' + path.basename( output ) + " -> " + path.dirname( output ) );

	var sourcemap = '';
	var sourcemapping = '';

	if ( args.sourcemaps ){

		sourcemap = output + '.map';
		sourcemapping = '\n//# sourceMappingURL=three.min.js.map';

	}

	var buffer = [];
	var sources = []; // used for source maps with minification

	if ( args.amd ){
		buffer.push('function ( root, factory ) {\n\n\tif ( typeof define === \'function\' && define.amd ) {\n\n\t\tdefine( [ \'exports\' ], factory );\n\n\t} else if ( typeof exports === \'object\' ) {\n\n\t\tfactory( exports );\n\n\t} else {\n\n\t\tfactory( root );\n\n\t}\n\n}( this, function ( exports ) {\n\n');
	};

	for ( var i = 0; i < args.include.length; i ++ ){

		var contents = fs.readFileSync( './includes/' + args.include[i] + '.json', 'utf8' );
		var files = JSON.parse( contents );

		for ( var j = 0; j < files.length; j ++ ){

			var file = '../../' + files[ j ];

			buffer.push('// File:' + files[ j ]);
			buffer.push('\n\n');

			contents = fs.readFileSync( file, 'utf8' );

			if( file.indexOf( '.glsl') >= 0 ) {

				contents = 'THREE.ShaderChunk[ \'' +
					path.basename( file, '.glsl' ) + '\' ] =' +
					JSON.stringify( contents ) + ';\n';

			}

			sources.push( { file: file, contents: contents } );
			buffer.push( contents );
			buffer.push( '\n' );
		}

	}

	if ( args.amd ){
		buffer.push('exports.THREE = THREE;\n\n} ) );');
	};

	var temp = buffer.join( '' );

	if ( !args.minify ){

		fs.writeFileSync( output, temp, 'utf8' );
		console.log( '  Compile Time: ' + (Date.now() - startTime)/1000 + 's');

	} else {

		var tempSourceFilename = random();
		fs.writeFileSync( tempSourceFilename, temp, 'utf8' );

		var LICENSE = "threejs.org/license";

		// Parsing

		var closureOptions = {
		  js: tempSourceFilename,
      externs: args.externs,
			jscomp_off: [ 'checkTypes', 'globalThis' ],
      compilation_level: 'SIMPLE',
      warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT5_STRICT',
      language_out: 'ECMASCRIPT5_STRICT',
      js_output_file: args.output,
			create_source_map: args.sourcemaps ? sourcemap : null
		};

		new ClosureCompiler( closureOptions ).run(function(exitCode, stdOut, stdErr) {

			if( exitCode !== 0 ) {
				console.error( stdErr );
		  	console.log( stdOut );
			}
			else {
					if( args.sourcemaps ) {
						fs.appendFileSync(output, sourcemapping, 'utf8');
					}
					console.log( '  Compile Time: ' + (Date.now() - startTime)/1000 + 's');
			}

		});

	}

}

main();
