var fs = require("fs");
var path = require("path");
var argparse =  require( "argparse" );
var uglify = require("uglify-js");
var spawn = require('child_process').spawn;

var scriptDir = __dirname;
var baseDir = path.resolve( scriptDir, '../..' );
var includesDir = path.resolve( scriptDir, 'includes' );
var externsDir = path.resolve( scriptDir, 'externs' );
var compilerDir = path.resolve( scriptDir, 'compiler' );
var defaultBuildDir = path.resolve( baseDir, 'build' );

var amdPrefix = [
	'function ( root, factory ) {',
	'\tif ( typeof define === \'function\' && define.amd ) {',
	'\t\tdefine( [ \'exports\' ], factory );',
	'\t} else if ( typeof exports === \'object\' ) {',
	'\t\tfactory( exports );',
	'\t} else {',
	'\t\tfactory( root );',
	'\t}',
	'}( this, function ( exports ) {',
	''
].join('\n\n');
var amdSuffix = 'exports.THREE = THREE;\n\n} ) );';

function getMinifiedOutputPath( outputPath ) {

	var dir = path.dirname( outputPath );
	var ext = path.extname( outputPath );
	var basename = path.basename( outputPath, ext );

	var result = path.join( dir, basename + '.min' + ext );
	return result;

}

function main() {

	"use strict";

	var parser = new argparse.ArgumentParser();
	parser.addArgument( ['--include'], { action: 'append', required: true } );
	parser.addArgument( ['--externs'], { action: 'append', defaultValue: [ path.resolve( externsDir, 'common.js' ) ] } );
	parser.addArgument( ['--amd'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--minify'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--output'], { defaultValue: path.resolve( defaultBuildDir, 'three.js' ) } );
	parser.addArgument( ['--minifiedoutput'] );
	parser.addArgument( ['--sourcemaps'], { action: 'storeTrue', defaultValue: true } );

	var args = parser.parseArgs();

	var outputPath = args.output;
	var minifiedOutputPath = args.minifiedoutput ? args.minifiedoutput : getMinifiedOutputPath( outputPath );

	console.log('Building ' + outputPath + ':');

	var startMS = Date.now();

	var sourcemapPath = '';
	var sourcemapping = '';

	if ( args.sourcemaps ){

		sourcemapPath = minifiedOutputPath + '.map';
		sourcemapping = '\n//# sourceMappingURL=' + path.basename( minifiedOutputPath ) + '.map';

	}

	var buffer = [];
	var sources = []; // used for source maps with minification

	if ( args.amd ){

		buffer.push( amdPrefix );

	};

	console.log( '  Collecting source files.' );

	for ( var i = 0; i < args.include.length; i ++ ){

		var includeFile = args.include[i] + '.json';
		var contents = fs.readFileSync( path.resolve( includesDir, includeFile ), 'utf8' );
		var files = JSON.parse( contents );

		for ( var j = 0; j < files.length; j ++ ){

			var file = path.resolve( baseDir, files[ j ] );

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

		buffer.push( amdSuffix );

	};

	var temp = buffer.join( '' );

	// Write un-minified output
	console.log( '  Writing un-minified output: ' + outputPath );
	fs.writeFileSync( outputPath, temp, 'utf8' );

	if ( args.minify ) {

		console.log( '  Uglyifying.' );

		var LICENSE = "threejs.org/license";

		// Parsing

		var toplevel = null;

		toplevel = uglify.parse( '// ' + LICENSE + '\n' );

		sources.forEach( function( source ) {

			toplevel = uglify.parse( source.contents, {
				filename: source.file,
				toplevel: toplevel
			} );

		} );

		// Compression

		toplevel.figure_out_scope();
		var compressor = uglify.Compressor( {} );
		var compressed_ast = toplevel.transform( compressor );

		// Mangling

		compressed_ast.figure_out_scope();
		compressed_ast.compute_char_frequency();
		compressed_ast.mangle_names();

		// output file

		var source_map_options = {
			file: path.basename(minifiedOutputPath),
			root: 'src'
		};

		var source_map = uglify.SourceMap( source_map_options )
		var stream = uglify.OutputStream( {
			source_map: source_map,
			comments: new RegExp( LICENSE )
		} );

		compressed_ast.print( stream );
		var code = stream.toString();

		console.log( '  Writing minified output: ' + minifiedOutputPath );

		fs.writeFileSync( minifiedOutputPath, code + sourcemapping, 'utf8' );

		if ( args.sourcemaps ) {

			console.log( '  Writing source map.' );

			fs.writeFileSync( sourcemapPath, source_map.toString(), 'utf8' );

		}

	}

	var deltaMS = Date.now() - startMS;
	console.log( "  --- Build time: " + ( deltaMS / 1000 ) + "s" );

}

main();
