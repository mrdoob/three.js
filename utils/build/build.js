var fs = require("fs");
var path = require("path");
var argparse =  require( "argparse" );
var uglify = require("uglify-js2");
var spawn = require('child_process').spawn;

function main() {

	"use strict";

	var parser = new argparse.ArgumentParser();
	parser.addArgument( ['--include'], { action: 'append', required: true } );
	parser.addArgument( ['--externs'], { action: 'append', defaultValue: ['./externs/common.js'] } );
	parser.addArgument( ['--amd'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--minify'], { action: 'storeTrue', defaultValue: false } );
	parser.addArgument( ['--output'], { defaultValue: '../../build/three.js' } );
	parser.addArgument( ['--sourcemaps'], { action: 'storeTrue', defaultValue: false } );

	
	var args = parser.parseArgs();
	
	var output = args.output;
	console.log(' * Building ' + output);
	
	var sourcemap = '';
	var sourcemapping = '';

	if ( args.sourcemaps ){

		sourcemap = output + '.map';
		sourcemapping = '\n//@ sourceMappingURL=' + sourcemap;

	}

	var buffer = [];
	var sources = [];
	
	if ( args.amd ){
		buffer.push('function ( root, factory ) {\n\n\tif ( typeof define === \'function\' && define.amd ) {\n\n\t\tdefine( [ \'exports\' ], factory );\n\n\t} else if ( typeof exports === \'object\' ) {\n\n\t\tfactory( exports );\n\n\t} else {\n\n\t\tfactory( root );\n\n\t}\n\n}( this, function ( exports ) {\n\n');
	};
	
	for ( var i = 0; i < args.include.length; i ++ ){
		
		var contents = fs.readFileSync( './includes/' + args.include[i] + '.json', 'utf8' );
		var files = JSON.parse( contents );

		for ( var j = 0; j < files.length; j ++ ){

			var file = '../../' + files[ j ];
			sources.push( file );
			buffer.push( fs.readFileSync( file, 'utf8' ) );

		}

	}
	
	if ( args.amd ){
		buffer.push('exports.THREE = THREE;\n\n} ) );');
	};
	
	var temp = buffer.join( '' );
	
	if ( !args.minify ){

		fs.writeFileSync( output,temp, 'utf8' );

	} else {

		var result = uglify.minify( sources, { outSourceMap: sourcemap } );
		
		fs.writeFileSync( output, '// three.js / threejs.org/license\n' + result.code + sourcemapping, 'utf8' );

		if ( args.sourcemaps ) {

			fs.writeFileSync( sourcemap, result.map, 'utf8' );

		}

	}

}

main();
