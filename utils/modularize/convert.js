/**
 * @author Jiulong Hu / http://hujiulong.com
 * Modularize files in examples/js by analyzing AST
 * Usage: node convert.js loaders/OBJLoader.js
 * node version >= 8
 */

const fs = require( 'fs-extra' );
const glob = require( 'tiny-glob/sync' );
const Module = require( './module' );

const SRC = '../../examples/js';

const paths = process.argv[ 2 ];

const options = {
	'libs/**/*.js': {
		ignore: true
	},
	'loaders/RGBELoader.js': {	
		exports: [ 'RGBELoader as HDRLoader' ],	
		process( code ) {	

 			return code	
				.replace( 'var HDRLoader = ', '' )	
				.replace( /\s+HDRLoader,/, '' );	

 		}
	},
};

convert( paths, options );

function convert( paths, options ) {

	const modules = [];
	const opts = {};

	const files = glob( `${SRC}/**/*.js` );
	const outputFiles = glob( `${SRC}/${paths}` );

	Object.keys( options ).forEach( path => {

		glob( `${SRC}/${path}` ).forEach( file => {

			opts[ file ] = opts[ file ] || {};
			Object.assign( opts[ file ], options[ path ] );

		} );

	} );

	files.forEach( file => {

		const {
			ignore,
			exports,
			dependences,
		} = opts[ file ] || {};

		if ( ignore ) {

			return;

		}

		const mod = new Module( file, {
			exports,
			dependences
		} );
		modules.push( mod );

	} );

	modules.forEach( mod => {

		const {
			process,
		} = opts[ mod.file ] || {};

		mod.resolveDeps( modules );

		if ( outputFiles.includes( mod.file ) ) {

			let output = mod.toString();

			if ( process ) {

				output = process( output );

			}
			const dest = mod.file.replace( '/examples/js/', '/examples/jsm/' );

			fs.ensureFileSync( dest );
			fs.writeFileSync( dest, output );

			console.log( `${mod.file} done` );

		}

	} );

}
