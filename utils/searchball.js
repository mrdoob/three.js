/**
 * @author munrocket / https://twitter.com/munrocket_twit
 */

const printImage = require( 'image-output' );
const jimp = require( 'jimp' );
const fs = require( 'fs' );

const outputRes = 1024;
const outputResFull = 4096;

( async () => {

	const pinkPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8rvTjPwAHOwMSKpP6zwAAAABJRU5ErkJggg==';
	let output = ( await jimp.read( Buffer.from( pinkPixel, 'base64' ) ) ).resize( outputResFull, outputResFull );

	let examples = [];
	eval( fs.readFileSync( './examples/files.js' ).toString() );
	Object.keys( files ).forEach( key => {
		files[ key ].forEach( name => examples.push( name ) );
	});

	const sideSize = Math.ceil( Math.sqrt( examples.length ) );
	const tileRes = outputResFull / sideSize;

	for ( let id = 0; id < examples.length; id ++ ) {

		const path = `./examples/screenshots/${ examples[ id ] }.png`;

		if ( fs.existsSync( path ) ) {

			const tile = ( await jimp.read( path ) ).resize( tileRes, tileRes );
			const i = id % sideSize;
			const j = Math.floor( id / sideSize );
			output.blit( tile, i * tileRes, j * tileRes );
			console.log( 'blit: ' + path );

		}

	}

	const pathFull = `./examples/screenshots/all_in_one_full.jpg`;
	output.quality( 90 ).write( pathFull );

	const path = `./examples/screenshots/all_in_one.jpg`;
	output.resize( outputRes, outputRes ).quality( 90 ).write( path );

	printImage( output.bitmap, console );
	console.log( 'out: ' + pathFull );
	console.log( 'out: ' + path );

} ) ();
