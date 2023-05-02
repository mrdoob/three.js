/* global require */
/* global process */
/* global parseGeom */
/* global Buffer */
const fs = require( 'fs' );
const path = require( 'path' );
require( './ogc-parser' );

const baseDir = process.argv[ 2 ];

function readJSON( name ) {

	return JSON.parse( fs.readFileSync( path.join( baseDir, name ), { encoding: 'utf-8' } ) );

}

function main() {

	const areas = readJSON( 'level1.json' );
	areas.forEach( ( area, ndx ) => {

		console.log( ndx );
		try {

			const buf = new Uint8Array( Buffer.from( area.geom, 'base64' ) );
			area.geom = parseGeom( buf );

		} catch ( e ) {

			console.log( 'ERROR:', e );
			console.log( JSON.stringify( area, null, 2 ) );
			throw e;

		}

	} );

	console.log( JSON.stringify( areas, null, 2 ) );

}

main();
