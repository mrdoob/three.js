import { BufferGeometry } from 'three';
import { gzipSync } from '../../../../examples/jsm/libs/fflate.module.js';
import { SPZLoader } from '../../../../examples/jsm/loaders/SPZLoader.js';
import { unpackSphericalHarmonicsBand } from '../utils/GaussianSplatTestUtils.js';

const EPS = 1e-6;
const SPZ_MAGIC = 0x5053474e;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15, 24 ];
const ZSTD_BLOCK_SIZE = 128 * 1024;
const ZSTD_STREAMS = {
	positions: [ 40, 181, 47, 253, 36, 9, 73, 0, 0, 24, 0, 0, 224, 255, 255, 4, 0, 0, 217, 129, 78, 197 ],
	alphas: [ 40, 181, 47, 253, 36, 1, 9, 0, 0, 64, 32, 92, 145, 170 ],
	colors: [ 40, 181, 47, 253, 36, 3, 25, 0, 0, 128, 128, 128, 108, 76, 221, 124 ],
	scales: [ 40, 181, 47, 253, 36, 3, 25, 0, 0, 160, 160, 160, 45, 81, 165, 163 ],
	rotations: [ 40, 181, 47, 253, 36, 4, 33, 0, 0, 0, 0, 0, 192, 45, 193, 30, 7 ],
	sh: [ 40, 181, 47, 253, 36, 9, 73, 0, 0, 129, 130, 131, 132, 133, 134, 135, 136, 137, 26, 198, 65, 35 ],
	sh4: [ 40, 181, 47, 253, 36, 72, 173, 1, 0, 228, 2, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 200, 1, 0, 182, 65, 25, 114, 99, 11, 195 ]
};

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function writeInt24( view, offset, value ) {

	view.setUint8( offset, value & 0xff );
	view.setUint8( offset + 1, ( value >> 8 ) & 0xff );
	view.setUint8( offset + 2, ( value >> 16 ) & 0xff );

}

function parseSPZ( buffer ) {

	return new Promise( ( resolve, reject ) => {

		new SPZLoader().parse( buffer, resolve, reject );

	} );

}

function createSPZBuffer( shDegree = 0 ) {

	const raw = new Uint8Array( 16 + 9 + 1 + 3 + 3 + 3 + SH_DEGREE_TO_VECTORS[ shDegree ] * 3 );
	const view = new DataView( raw.buffer );
	let offset = 0;

	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, 2, true );
	view.setUint32( 8, 1, true );
	view.setUint8( 12, shDegree );
	view.setUint8( 13, 4 );
	view.setUint8( 14, 0 );
	view.setUint8( 15, 0 );
	offset = 16;

	writeInt24( view, offset, 24 );
	writeInt24( view, offset + 3, - 32 );
	writeInt24( view, offset + 6, 4 );
	offset += 9;

	raw[ offset ++ ] = 64;
	raw.set( [ 128, 128, 128 ], offset );
	offset += 3;
	raw.set( [ 160, 160, 160 ], offset );
	offset += 3;
	raw.set( [ 128, 128, 128 ], offset );
	offset += 3;

	for ( let i = 0, il = SH_DEGREE_TO_VECTORS[ shDegree ] * 3; i < il; i ++ ) {

		raw[ offset ++ ] = 129 + i;

	}

	return gzipSync( raw ).buffer;

}

// Wraps the data in a ZSTD frame of raw (uncompressed) blocks, so streams of
// any size can be created without a compressor.
function createZSTDFrame( data ) {

	const blockCount = Math.max( 1, Math.ceil( data.length / ZSTD_BLOCK_SIZE ) );
	const frame = new Uint8Array( 6 + blockCount * 3 + data.length );
	let offset = 6;

	// Magic number, frame header descriptor and window descriptor (128 KB).
	frame.set( [ 0x28, 0xb5, 0x2f, 0xfd, 0x00, 0x38 ] );

	for ( let i = 0; i < blockCount; i ++ ) {

		const block = data.subarray( i * ZSTD_BLOCK_SIZE, ( i + 1 ) * ZSTD_BLOCK_SIZE );
		const header = ( block.length << 3 ) | ( i === blockCount - 1 ? 1 : 0 );

		frame[ offset ++ ] = header & 0xff;
		frame[ offset ++ ] = ( header >> 8 ) & 0xff;
		frame[ offset ++ ] = ( header >> 16 ) & 0xff;
		frame.set( block, offset );
		offset += block.length;

	}

	return frame;

}

// Uncompressed SPZ v4 attribute streams in file order. Alphas and spherical
// harmonics are pseudo-random, so misplaced bytes can't go unnoticed.
function createSPZV4Attributes( count, shDegree = 0 ) {

	const random = ( length, seed ) => Uint8Array.from( { length }, ( _, i ) => Math.imul( i + seed, 0x9e3779b1 ) >>> 24 );

	const attributes = {
		positions: new Uint8Array( count * 9 ),
		alphas: random( count, 1 ),
		colors: new Uint8Array( count * 3 ).fill( 128 ),
		scales: new Uint8Array( count * 3 ).fill( 160 ),
		rotations: new Uint8Array( new Uint32Array( count ).fill( 0xc0000000 ).buffer )
	};

	if ( shDegree > 0 ) attributes.sphericalHarmonics = random( count * SH_DEGREE_TO_VECTORS[ shDegree ] * 3, 2 );

	return attributes;

}

function createSPZV4Buffer( { version = 4, count = 1, shDegree = 1, flags = 0, extensionBytes = new Uint8Array(), streams: customStreams } = {} ) {

	const streams = customStreams || ( shDegree === 0 ?
		[ ZSTD_STREAMS.positions, ZSTD_STREAMS.alphas, ZSTD_STREAMS.colors, ZSTD_STREAMS.scales, ZSTD_STREAMS.rotations ] :
		[ ZSTD_STREAMS.positions, ZSTD_STREAMS.alphas, ZSTD_STREAMS.colors, ZSTD_STREAMS.scales, ZSTD_STREAMS.rotations, shDegree === 4 ? ZSTD_STREAMS.sh4 : ZSTD_STREAMS.sh ] );
	const uncompressedSizes = ( shDegree === 0 ?
		[ 9, 1, 3, 3, 4 ] :
		[ 9, 1, 3, 3, 4, SH_DEGREE_TO_VECTORS[ shDegree ] * 3 ] ).map( ( size ) => size * count );
	const headerSize = 32;
	const tocByteOffset = headerSize + extensionBytes.length;
	const tocSize = streams.length * 16;
	const compressedSize = streams.reduce( ( sum, stream ) => sum + stream.length, 0 );
	const raw = new Uint8Array( tocByteOffset + tocSize + compressedSize );
	const view = new DataView( raw.buffer );
	let offset = tocByteOffset + tocSize;

	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, version, true );
	view.setUint32( 8, count, true );
	view.setUint8( 12, shDegree );
	view.setUint8( 13, 4 );
	view.setUint8( 14, flags );
	view.setUint8( 15, streams.length );
	view.setUint32( 16, tocByteOffset, true );
	raw.set( extensionBytes, headerSize );

	for ( let i = 0; i < streams.length; i ++ ) {

		const stream = streams[ i ];
		const entryOffset = tocByteOffset + i * 16;

		view.setBigUint64( entryOffset, BigInt( stream.length ), true );
		view.setBigUint64( entryOffset + 8, BigInt( uncompressedSizes[ i ] ), true );
		raw.set( stream, offset );
		offset += stream.length;

	}

	return raw.buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'SPZLoader', () => {

			QUnit.test( 'parses SPZ v2 fixed-point data', async ( assert ) => {

				const data = await parseSPZ( createSPZBuffer() );

				const covariances = data.getAttribute( 'covariance' ).array;

				assert.ok( data instanceof BufferGeometry, 'returns BufferGeometry' );
				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1.5, - 2, 0.25 ], 'fixed-point centers' );
				closeTo( assert, covariances[ 0 ], 1, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 1, 'covariance yy' );
				closeTo( assert, covariances[ 5 ], 1, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 64 ], 'degree-0 color and alpha' );

			} );

			QUnit.test( 'parses SPZ v4 ZSTD stream data', async ( assert ) => {

				const data = await parseSPZ( createSPZV4Buffer() );
				const covariances = data.getAttribute( 'covariance' ).array;

				assert.ok( data instanceof BufferGeometry, 'returns BufferGeometry' );
				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1.5, - 2, 0.25 ], 'fixed-point centers' );
				closeTo( assert, covariances[ 0 ], 1, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 1, 'covariance yy' );
				closeTo( assert, covariances[ 5 ], 1, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 64 ], 'degree-0 color and alpha' );
				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 1, 1 ) ), [
					129, 130, 131,
					132, 133, 134,
					135, 136, 137
				], 'SH1 coefficients' );

			} );

			QUnit.test( 'warns when skipping SPZ v4 vendor extensions', async ( assert ) => {

				const warn = console.warn;
				const warnings = [];

				console.warn = ( message ) => {

					warnings.push( message );

				};

				try {

					await parseSPZ( createSPZV4Buffer( {
						flags: 0x02,
						extensionBytes: new Uint8Array( [ 0x02, 0x00, 0xbe, 0xad, 0x01, 0x00, 0x00, 0x00, 0xff ] )
					} ) );

				} finally {

					console.warn = warn;

				}

				assert.strictEqual( warnings.length, 1, 'emits one warning' );
				assert.ok( /vendor extensions/.test( warnings[ 0 ] ), 'warning mentions extensions' );

			} );

			QUnit.test( 'parses SPZ v4 spherical harmonics degree 4 as degree 3 data', async ( assert ) => {

				const data = await parseSPZ( createSPZV4Buffer( { shDegree: 4 } ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics3' ).array, 1, 3 ) ), [
					153, 154, 155,
					156, 157, 158,
					159, 160, 161,
					162, 163, 164,
					165, 166, 167,
					168, 169, 170,
					171, 172, 173
				], 'SH3 coefficients' );
				assert.strictEqual( data.getAttribute( 'sphericalHarmonics4' ), undefined, 'SH4 coefficients are ignored' );

			} );

			QUnit.test( 'parses SPZ v4 streams larger than one ZSTD input chunk', async ( assert ) => {

				// 45 SH bytes per splat, so the SH stream is 9 MB and spans two input chunks.
				const count = 200000;
				const attributes = createSPZV4Attributes( count, 3 );
				const data = await parseSPZ( createSPZV4Buffer( { count, shDegree: 3, streams: Object.values( attributes ).map( createZSTDFrame ) } ) );
				const colors = data.getAttribute( 'color' ).array;
				const sh3 = unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics3' ).array, count, 3 );

				assert.strictEqual( data.getAttribute( 'position' ).count, count, 'count' );
				assert.ok( attributes.alphas.every( ( alpha, i ) => colors[ i * 4 + 3 ] === alpha ), 'alphas' );
				assert.ok( sh3.every( ( value, i ) => value === attributes.sphericalHarmonics[ Math.floor( i / 21 ) * 45 + 24 + i % 21 ] ), 'SH3 coefficients' );

			} );

			QUnit.test( 'rejects invalid SPZ v4 ZSTD streams', async ( assert ) => {

				const count = 16;
				const attributes = createSPZV4Attributes( count );

				function parse( modify ) {

					const streams = Object.values( attributes ).map( createZSTDFrame );

					modify( streams );

					return parseSPZ( createSPZV4Buffer( { count, shDegree: 0, streams } ) );

				}

				await assert.rejects( parse( ( streams ) => {

					streams[ 0 ] = streams[ 0 ].subarray( 0, streams[ 0 ].length >> 1 );

				} ), 'truncated stream' );

				await assert.rejects( parse( ( streams ) => {

					streams[ 1 ] = createZSTDFrame( attributes.alphas.subarray( 0, count - 1 ) );

				} ), /decoded to 15 bytes, expected 16/, 'stream shorter than expected' );

				await assert.rejects( parse( ( streams ) => {

					streams[ 1 ] = createZSTDFrame( new Uint8Array( count + 1 ) );

				} ), /decoded to more than 16 bytes/, 'stream longer than expected' );

				await assert.rejects( parse( ( streams ) => {

					streams[ 2 ][ 0 ] ^= 0xff;

				} ), /decoding stalled/, 'corrupt frame magic' );

				const data = await parse( () => {} );

				assert.strictEqual( data.getAttribute( 'position' ).count, count, 'valid data still loads afterwards' );

			} );

			QUnit.test( 'rejects unsupported SPZ versions', async ( assert ) => {

				await assert.rejects( parseSPZ( createSPZV4Buffer( { version: 5 } ) ), /SPZ version 5 is not supported/, 'SPZ v5' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 1 data', async ( assert ) => {

				const data = await parseSPZ( createSPZBuffer( 1 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 1, 1 ) ), [
					129, 130, 131,
					132, 133, 134,
					135, 136, 137
				], 'SH1 coefficients' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 2 data', async ( assert ) => {

				const data = await parseSPZ( createSPZBuffer( 2 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics2' ).array, 1, 2 ) ), [
					138, 139, 140,
					141, 142, 143,
					144, 145, 146,
					147, 148, 149,
					150, 151, 152
				], 'SH2 coefficients' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 3 data', async ( assert ) => {

				const data = await parseSPZ( createSPZBuffer( 3 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics3' ).array, 1, 3 ) ), [
					153, 154, 155,
					156, 157, 158,
					159, 160, 161,
					162, 163, 164,
					165, 166, 167,
					168, 169, 170,
					171, 172, 173
				], 'SH3 coefficients' );

			} );

		} );

	} );

} );
