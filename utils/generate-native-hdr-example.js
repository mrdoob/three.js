import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

import { HDRLoader } from '../examples/jsm/loaders/HDRLoader.js';
import { FloatType } from '../src/Three.js';

// Generates PQ encoder inputs from the existing CC0 example photograph.
const root = path.resolve();
const output = path.resolve( process.argv[ 2 ] || 'generated-native-hdr' ); fs.mkdirSync( output, { recursive: true } );
const source = fs.readFileSync( path.join( root, 'examples/textures/equirectangular/venice_sunset_1k.hdr' ) );
const image = new HDRLoader().setDataType( FloatType ).parse( source.buffer.slice( source.byteOffset, source.byteOffset + source.byteLength ) );
const width = 512, height = 256, scale = image.width / width;
const rgb = Buffer.alloc( width * height * 6 );
let sourceMax = 0, downsampleMax = 0, clampedChannels = 0;
for ( let i = 0; i < image.data.length; i += 4 ) for ( let c = 0; c < 3; c ++ ) sourceMax = Math.max( sourceMax, image.data[ i + c ] );
function pq( nits ) {

	const q = ( nits / 10000 ) ** ( 2610 / 16384 ); return ( ( 3424 / 4096 + 2413 / 128 * q ) / ( 1 + 2392 / 128 * q ) ) ** ( 2523 / 32 );

}

for ( let y = 0; y < height; y ++ ) for ( let x = 0; x < width; x ++ ) for ( let c = 0; c < 3; c ++ ) {

	let sum = 0;
	for ( let dy = 0; dy < scale; dy ++ ) for ( let dx = 0; dx < scale; dx ++ ) sum += image.data[ ( ( y * scale + dy ) * image.width + x * scale + dx ) * 4 + c ];
	const linear = sum / ( scale * scale ) / 64; downsampleMax = Math.max( downsampleMax, linear );
	if ( linear * 203 > 10000 ) clampedChannels ++;
	rgb.writeUInt16BE( Math.round( pq( Math.min( 10000, Math.max( 0, linear * 203 ) ) ) * 65535 ), ( ( y * width + x ) * 3 + c ) * 2 );

}

function crc32( buffer ) {

	let crc = 0xffffffff; for ( const byte of buffer ) {

		crc ^= byte; for ( let j = 0; j < 8; j ++ )crc = ( crc >>> 1 ) ^ ( ( crc & 1 ) ? 0xedb88320 : 0 );

	}

	return ( crc ^ 0xffffffff ) >>> 0;

}

function chunk( type, data ) {

	const name = Buffer.from( type ), length = Buffer.alloc( 4 ), crc = Buffer.alloc( 4 ); length.writeUInt32BE( data.length ); crc.writeUInt32BE( crc32( Buffer.concat( [ name, data ] ) ) ); return Buffer.concat( [ length, name, data, crc ] );

}

const header = Buffer.alloc( 13 ); header.writeUInt32BE( width ); header.writeUInt32BE( height, 4 ); header[ 8 ] = 16; header[ 9 ] = 2;
const scanlines = Buffer.alloc( height * ( 1 + width * 6 ) ); for ( let y = 0; y < height; y ++ )rgb.copy( scanlines, y * ( 1 + width * 6 ) + 1, y * width * 6, ( y + 1 ) * width * 6 );
const png = path.join( output, 'venice_sunset_512_pq.png' ), ppm = path.join( output, 'venice_sunset_512_pq.ppm' );
fs.writeFileSync( png, Buffer.concat( [ Buffer.from( [ 137, 80, 78, 71, 13, 10, 26, 10 ] ), chunk( 'IHDR', header ), chunk( 'IDAT', deflateSync( scanlines ) ), chunk( 'IEND', Buffer.alloc( 0 ) ) ] ) );
fs.writeFileSync( ppm, Buffer.concat( [ Buffer.from( `P6\n${width} ${height}\n65535\n` ), rgb ] ) );
console.log( { sourceMax, downsampleMax, clampedChannels, sourceRadianceScale: 64 } );


