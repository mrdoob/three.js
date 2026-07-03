import { DataUtils } from 'three';
import { gzipSync } from '../../../../examples/jsm/libs/fflate.module.js';
import { GaussianSplatSPZLoader } from '../../../../examples/jsm/loaders/GaussianSplatSPZLoader.js';
import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';

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

function createSPZBuffer( {
	version = 2,
	shDegree = 0,
	fractionalBits = 4,
	center = [ 1.5, - 2, 0.25 ],
	alpha = 64,
	color = [ 128, 128, 128 ],
	scale = [ 160, 160, 160 ],
	rotation = version === 3 ? [ 0, 0, 0, 0xc0 ] : [ 128, 128, 128 ],
	sh = []
} = {} ) {

	const count = 1;
	const positionBytes = version === 1 ? 6 : 9;
	const rotationBytes = version === 3 ? 4 : 3;
	const raw = new Uint8Array( 16 + positionBytes + 1 + 3 + 3 + rotationBytes + sh.length );
	const view = new DataView( raw.buffer );
	let offset = 0;

	view.setUint32( 0, SPZ_MAGIC, true );
	view.setUint32( 4, version, true );
	view.setUint32( 8, count, true );
	view.setUint8( 12, shDegree );
	view.setUint8( 13, fractionalBits );
	view.setUint8( 14, 0 );
	view.setUint8( 15, 0 );
	offset = 16;

	if ( version === 1 ) {

		view.setUint16( offset, DataUtils.toHalfFloat( center[ 0 ] ), true );
		view.setUint16( offset + 2, DataUtils.toHalfFloat( center[ 1 ] ), true );
		view.setUint16( offset + 4, DataUtils.toHalfFloat( center[ 2 ] ), true );
		offset += 6;

	} else {

		const scale = 1 << fractionalBits;
		writeInt24( view, offset, Math.round( center[ 0 ] * scale ) );
		writeInt24( view, offset + 3, Math.round( center[ 1 ] * scale ) );
		writeInt24( view, offset + 6, Math.round( center[ 2 ] * scale ) );
		offset += 9;

	}

	raw[ offset ++ ] = alpha;
	raw.set( color, offset );
	offset += 3;
	raw.set( scale, offset );
	offset += 3;
	raw.set( rotation, offset );
	offset += rotationBytes;
	raw.set( sh, offset );

	return gzipSync( raw ).buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GaussianSplatSPZLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();

				assert.ok( loader instanceof GaussianSplatSPZLoader, 'Can instantiate a GaussianSplatSPZLoader.' );

			} );

			QUnit.test( 'parses SPZ v2 fixed-point data', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();
				const data = loader.parse( createSPZBuffer() );

				assert.ok( data instanceof GaussianSplatData, 'returns GaussianSplatData' );
				assert.strictEqual( data.count, 1, 'count' );
				assert.deepEqual( Array.from( data.centers ), [ 1.5, - 2, 0.25 ], 'fixed-point centers' );
				closeTo( assert, data.covariances[ 0 ], 1, 'covariance xx' );
				closeTo( assert, data.covariances[ 3 ], 1, 'covariance yy' );
				closeTo( assert, data.covariances[ 5 ], 1, 'covariance zz' );
				assert.deepEqual( Array.from( data.colors ), [ 128, 128, 128, 64 ], 'degree-0 color and alpha' );

			} );

			QUnit.test( 'parses SPZ v1 half-float centers', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();
				const data = loader.parse( createSPZBuffer( { version: 1, center: [ 0.5, 1, - 1.5 ] } ) );

				assert.deepEqual( Array.from( data.centers ), [ 0.5, 1, - 1.5 ], 'half-float centers' );

			} );

			QUnit.test( 'parses SPZ v3 smallest-three rotations', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();
				const data = loader.parse( createSPZBuffer( { version: 3, scale: [ 176, 160, 160 ] } ) );

				closeTo( assert, data.covariances[ 0 ], Math.E * Math.E, 'covariance xx' );
				closeTo( assert, data.covariances[ 3 ], 1, 'covariance yy' );
				closeTo( assert, data.covariances[ 5 ], 1, 'covariance zz' );

			} );

			QUnit.test( 'skips higher-order spherical harmonic payloads', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();
				const data = loader.parse( createSPZBuffer( { shDegree: 1, sh: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] } ) );

				assert.deepEqual( Array.from( data.colors ), [ 128, 128, 128, 64 ], 'SH payload does not affect baked color' );

			} );

			QUnit.test( 'rejects invalid magic', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();
				const raw = new Uint8Array( 16 );

				assert.throws(
					() => loader.parse( gzipSync( raw ).buffer ),
					/Invalid SPZ magic/,
					'invalid magic is rejected'
				);

			} );

			QUnit.test( 'rejects unsupported versions', ( assert ) => {

				const loader = new GaussianSplatSPZLoader();

				assert.throws(
					() => loader.parse( createSPZBuffer( { version: 4 } ) ),
					/Unsupported SPZ version 4/,
					'unsupported version is rejected'
				);

			} );

		} );

	} );

} );
