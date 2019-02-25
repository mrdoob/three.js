/**
 * @author Jiulong Hu / http://hujiulong.com
 * Modularize all files in examples/js by analyzing AST
 * node version >= 8 
 */

const fs = require( 'fs-extra' );
const glob = require( 'tiny-glob/sync' );
const Module = require( './module' );

const SRC = 'examples/js';
const DEST = 'examples/jsm';

const paths = {
	'controls/*.js': {
		convert: true
	},
	'loaders/**/*.js': {
		convert: true
	},
	'postprocessing/*.js': {
		convert: true
	},
	'renderers/*.js': {
		convert: true
	},
	'controls/**/*.js': {
		convert: true
	},
	'shaders/*.js': {
		convert: true
	},
	'curves/*.js': {
		convert: true
	},
	'utils/**/*.js': {
		convert: true
	},
	'loaders/sea3d/**/*.js': {
		convert: false
	},
	'loaders/RGBELoader.js': {
		exports: [ 'RGBELoader as HDRLoader' ],
		process( code ) {

			return code
				.replace( 'var HDRLoader = ', '' )
				.replace( /\s+HDRLoader,/, '' );

		}
	},
	'Volume.js': {
		convert: true
	},
	'VolumeSlice.js': {
		convert: true
	},
	'renderers/RayTracingWorker.js': {
		copy: true
	},
};

convert( paths );

function convert( paths ) {

	const files = {};
	const modules = [];

	Object.keys( paths ).forEach( path => {

		glob( `${SRC}/${path}` ).forEach( file => {

			files[ file ] = files[ file ] || {};
			Object.assign( files[ file ], paths[ path ] );

		} );

	} );

	Object.keys( files ).forEach( file => {

		const {
			convert,
			copy,
			exports,
			dependences,
		} = files[ file ];

		if ( copy ) {

			const dest = file.replace( SRC, DEST );
			fs.ensureFileSync( dest );
			fs.copyFileSync( file, dest );
			return;

		}

		if ( convert ) {

			const mod = new Module( file, {
				exports,
				dependences
			} );
			modules.push( mod );

		}

	} );

	modules.forEach( mod => {

		const {
			process,
		} = files[ mod.file ];

		mod.resolveDeps( modules );

		let output = mod.toString();

		if ( process ) {

			output = process( output );

		}

		const dest = mod.file.replace( /^examples\/js/, DEST );

		fs.ensureFileSync( dest );
		fs.writeFileSync( dest, output );

	} );

}
