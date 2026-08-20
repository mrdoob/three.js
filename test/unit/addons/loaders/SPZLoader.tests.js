import { BufferGeometry } from 'three';
import { gzipSync } from '../../../../examples/jsm/libs/fflate.module.js';
import { SPZLoader } from '../../../../examples/jsm/loaders/SPZLoader.js';
import { unpackSphericalHarmonicsBand } from '../utils/GaussianSplatTestUtils.js';

const EPS = 1e-6;
const SPZ_MAGIC = 0x5053474e;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15, 24 ];
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

function createSPZV4Buffer( { version = 4, shDegree = 1, flags = 0, extensionBytes = new Uint8Array() } = {} ) {

	const streams = shDegree === 0 ?
		[ ZSTD_STREAMS.positions, ZSTD_STREAMS.alphas, ZSTD_STREAMS.colors, ZSTD_STREAMS.scales, ZSTD_STREAMS.rotations ] :
		[ ZSTD_STREAMS.positions, ZSTD_STREAMS.alphas, ZSTD_STREAMS.colors, ZSTD_STREAMS.scales, ZSTD_STREAMS.rotations, shDegree === 4 ? ZSTD_STREAMS.sh4 : ZSTD_STREAMS.sh ];
	const uncompressedSizes = shDegree === 0 ?
		[ 9, 1, 3, 3, 4 ] :
		[ 9, 1, 3, 3, 4, SH_DEGREE_TO_VECTORS[ shDegree ] * 3 ];
	const headerSize = 32;
	const tocByteOffset = headerSize + extensionBytes.length;
	const tocSize = streams.length * 16;
	const compressedSize = streams.reduce( ( sum, stream ) => sum + stream.length, 0 );
	const raw = new Uint8Array( tocByteOffset + tocSize + compressedSize );
	const view = new DataView( raw.buffer );
	let offset = tocByteOffset + tocSize;

	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, version, true );
	view.setUint32( 8, 1, true );
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
