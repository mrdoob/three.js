var fs = require("fs");
var path = require("path");
var argparse =  require( "argparse" );
var uglify = require("uglify-js");
var spawn = require('child_process').spawn;

function main() {

	"use strict";

	var parser = new argparse.ArgumentParser();
	parser.addArgument( ['--include'], { action: 'append', required: true } );
	parser.addArgument( ['--externs'], { action: 'append', defaultValue: ['./externs/common.js'] } );
	parser.addArgument( ['--amd'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--minify'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--output'], { defaultValue: '../../build/three.js' } );
	parser.addArgument( ['--sourcemaps'], { action: 'storeTrue', defaultValue: true } );

	
	var args = parser.parseArgs();
	
	var output = args.output;
	console.log(' * Building ' + output);
	
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

	} else {

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

		// Output

		var source_map_options = {
			file: 'three.min.js',
			root: 'src'
		};

		var source_map = uglify.SourceMap( source_map_options )
		var stream = uglify.OutputStream( {
			source_map: source_map,
			comments: new RegExp( LICENSE )
		} );

		compressed_ast.print( stream );
		var code = stream.toString();

		fs.writeFileSync( output, code + sourcemapping, 'utf8' );

		if ( args.sourcemaps ) {

			fs.writeFileSync( sourcemap, source_map.toString(), 'utf8' );

		}

	}

}

main();
