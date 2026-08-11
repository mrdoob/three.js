import { BufferGeometry } from 'three';
import { gzipSync } from '../../../../examples/jsm/libs/fflate.module.js';
import { SPZLoader } from '../../../../examples/jsm/loaders/SPZLoader.js';
import { unpackSphericalHarmonicsBand } from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

const EPS = 1e-6;
const SPZ_MAGIC = 0x5053474e;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15 ];

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function writeInt24( view, offset, value ) {

	view.setUint8( offset, value & 0xff );
	view.setUint8( offset + 1, ( value >> 8 ) & 0xff );
	view.setUint8( offset + 2, ( value >> 16 ) & 0xff );

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

function createUnsupportedSPZBuffer( version ) {

	const raw = new ArrayBuffer( 32 );
	const view = new DataView( raw );
	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, version, true );
	return raw;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'SPZLoader', () => {

			QUnit.test( 'parses SPZ v2 fixed-point data', ( assert ) => {

				const loader = new SPZLoader();
				const data = loader.parse( createSPZBuffer() );

				const covariances = data.getAttribute( 'covariance' ).array;

				assert.ok( data instanceof BufferGeometry, 'returns BufferGeometry' );
				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1.5, - 2, 0.25 ], 'fixed-point centers' );
				closeTo( assert, covariances[ 0 ], 1, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 1, 'covariance yy' );
				closeTo( assert, covariances[ 5 ], 1, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 64 ], 'degree-0 color and alpha' );

			} );

			QUnit.test( 'rejects SPZ version 4 and later', ( assert ) => {

				const loader = new SPZLoader();

				assert.throws( () => loader.parse( createUnsupportedSPZBuffer( 4 ) ), /SPZ version 4 is not supported/, 'SPZ v4' );
				assert.throws( () => loader.parse( createUnsupportedSPZBuffer( 5 ) ), /SPZ version 5 is not supported/, 'SPZ v5' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 1 data', ( assert ) => {

				const loader = new SPZLoader();
				const data = loader.parse( createSPZBuffer( 1 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 1, 1 ) ), [
					129, 130, 131,
					132, 133, 134,
					135, 136, 137
				], 'SH1 coefficients' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 2 data', ( assert ) => {

				const loader = new SPZLoader();
				const data = loader.parse( createSPZBuffer( 2 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics2' ).array, 1, 2 ) ), [
					138, 139, 140,
					141, 142, 143,
					144, 145, 146,
					147, 148, 149,
					150, 151, 152
				], 'SH2 coefficients' );

			} );

			QUnit.test( 'parses SPZ spherical harmonics degree 3 data', ( assert ) => {

				const loader = new SPZLoader();
				const data = loader.parse( createSPZBuffer( 3 ) );

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
