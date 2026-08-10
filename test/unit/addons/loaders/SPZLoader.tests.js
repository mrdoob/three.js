import { BufferGeometry } from 'three';
import { gzipSync } from '../../../../examples/jsm/libs/fflate.zip.module.js';
import { SPZLoader } from '../../../../examples/jsm/loaders/SPZLoader.js';

const EPS = 1e-6;
const SPZ_MAGIC = 0x5053474e;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function writeInt24( view, offset, value ) {

	view.setUint8( offset, value & 0xff );
	view.setUint8( offset + 1, ( value >> 8 ) & 0xff );
	view.setUint8( offset + 2, ( value >> 16 ) & 0xff );

}

function createSPZBuffer() {

	const raw = new Uint8Array( 16 + 9 + 1 + 3 + 3 + 3 );
	const view = new DataView( raw.buffer );
	let offset = 0;

	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, 2, true );
	view.setUint32( 8, 1, true );
	view.setUint8( 12, 0 );
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

	return gzipSync( raw ).buffer;

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

		} );

	} );

} );
