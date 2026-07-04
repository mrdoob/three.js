import { DataUtils } from 'three';
import { GaussianSplatKSplatLoader } from '../../../../examples/jsm/loaders/GaussianSplatKSplatLoader.js';
import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';

const EPS = 1e-6;
const HEADER_SIZE_BYTES = 4096;
const SECTION_HEADER_SIZE_BYTES = 1024;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createKSplatBuffer( { compressionLevel = 0, shDegree = 0 } = {} ) {

	const compression = compressionLevel === 0 ? {
		bytesPerSplat: 44,
		scaleOffsetBytes: 12,
		rotationOffsetBytes: 24,
		colorOffsetBytes: 40,
		bucketBytes: 0
	} : {
		bytesPerSplat: 24,
		scaleOffsetBytes: 6,
		rotationOffsetBytes: 12,
		colorOffsetBytes: 20,
		bucketBytes: 12
	};
	const shComponents = [ 0, 9, 24, 45 ][ shDegree ];
	const bytesPerSHComponent = compressionLevel === 0 ? 4 : compressionLevel === 1 ? 2 : 1;
	const bytesPerSplat = compression.bytesPerSplat + shComponents * bytesPerSHComponent;
	const buffer = new ArrayBuffer( HEADER_SIZE_BYTES + SECTION_HEADER_SIZE_BYTES + compression.bucketBytes + bytesPerSplat );
	const view = new DataView( buffer );
	const bytes = new Uint8Array( buffer );
	const sectionOffset = HEADER_SIZE_BYTES;
	const dataOffset = HEADER_SIZE_BYTES + SECTION_HEADER_SIZE_BYTES + compression.bucketBytes;

	view.setUint8( 0, 0 );
	view.setUint8( 1, 1 );
	view.setUint32( 4, 1, true );
	view.setUint32( 8, 1, true );
	view.setUint32( 12, 1, true );
	view.setUint32( 16, 1, true );
	view.setUint16( 20, compressionLevel, true );

	view.setUint32( sectionOffset, 1, true );
	view.setUint32( sectionOffset + 4, 1, true );
	view.setUint32( sectionOffset + 8, compressionLevel === 0 ? 0 : 1, true );
	view.setUint32( sectionOffset + 12, compressionLevel === 0 ? 0 : 1, true );
	view.setFloat32( sectionOffset + 16, 4, true );
	view.setUint16( sectionOffset + 20, compression.bucketBytes, true );
	view.setUint32( sectionOffset + 24, 32767, true );
	view.setUint32( sectionOffset + 32, compressionLevel === 0 ? 0 : 1, true );
	view.setUint32( sectionOffset + 36, 0, true );
	view.setUint16( sectionOffset + 40, shDegree, true );

	if ( compressionLevel === 0 ) {

		view.setFloat32( dataOffset, 1, true );
		view.setFloat32( dataOffset + 4, 2, true );
		view.setFloat32( dataOffset + 8, 3, true );
		view.setFloat32( dataOffset + compression.scaleOffsetBytes, 2, true );
		view.setFloat32( dataOffset + compression.scaleOffsetBytes + 4, 3, true );
		view.setFloat32( dataOffset + compression.scaleOffsetBytes + 8, 4, true );
		view.setFloat32( dataOffset + compression.rotationOffsetBytes, 1, true );
		view.setFloat32( dataOffset + compression.rotationOffsetBytes + 4, 0, true );
		view.setFloat32( dataOffset + compression.rotationOffsetBytes + 8, 0, true );
		view.setFloat32( dataOffset + compression.rotationOffsetBytes + 12, 0, true );

	} else {

		const bucketOffset = HEADER_SIZE_BYTES + SECTION_HEADER_SIZE_BYTES;

		view.setFloat32( bucketOffset, 1, true );
		view.setFloat32( bucketOffset + 4, 2, true );
		view.setFloat32( bucketOffset + 8, 3, true );
		view.setUint16( dataOffset, 32767, true );
		view.setUint16( dataOffset + 2, 32767, true );
		view.setUint16( dataOffset + 4, 32767, true );
		view.setUint16( dataOffset + compression.scaleOffsetBytes, DataUtils.toHalfFloat( 2 ), true );
		view.setUint16( dataOffset + compression.scaleOffsetBytes + 2, DataUtils.toHalfFloat( 3 ), true );
		view.setUint16( dataOffset + compression.scaleOffsetBytes + 4, DataUtils.toHalfFloat( 4 ), true );
		view.setUint16( dataOffset + compression.rotationOffsetBytes, DataUtils.toHalfFloat( 1 ), true );
		view.setUint16( dataOffset + compression.rotationOffsetBytes + 2, DataUtils.toHalfFloat( 0 ), true );
		view.setUint16( dataOffset + compression.rotationOffsetBytes + 4, DataUtils.toHalfFloat( 0 ), true );
		view.setUint16( dataOffset + compression.rotationOffsetBytes + 6, DataUtils.toHalfFloat( 0 ), true );

	}

	bytes.set( [ 10, 20, 30, 40 ], dataOffset + compression.colorOffsetBytes );

	return buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GaussianSplatKSplatLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();

				assert.ok( loader instanceof GaussianSplatKSplatLoader, 'Can instantiate a GaussianSplatKSplatLoader.' );

			} );

			QUnit.test( 'parses uncompressed KSplat data', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();
				const data = loader.parse( createKSplatBuffer() );

				assert.ok( data instanceof GaussianSplatData, 'returns GaussianSplatData' );
				assert.strictEqual( data.count, 1, 'count' );
				assert.deepEqual( Array.from( data.centers ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, data.covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, data.covariances[ 1 ], 0, 'covariance xy' );
				closeTo( assert, data.covariances[ 2 ], 0, 'covariance xz' );
				closeTo( assert, data.covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, data.covariances[ 4 ], 0, 'covariance yz' );
				closeTo( assert, data.covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.colors ), [ 10, 20, 30, 40 ], 'colors' );

			} );

			QUnit.test( 'parses bucket-compressed KSplat data', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();
				const data = loader.parse( createKSplatBuffer( { compressionLevel: 1 } ) );

				assert.deepEqual( Array.from( data.centers ), [ 1, 2, 3 ], 'bucketed centers' );
				closeTo( assert, data.covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, data.covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, data.covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.colors ), [ 10, 20, 30, 40 ], 'colors' );

			} );

			QUnit.test( 'skips higher-order spherical harmonic payloads', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();
				const data = loader.parse( createKSplatBuffer( { shDegree: 1 } ) );

				assert.deepEqual( Array.from( data.colors ), [ 10, 20, 30, 40 ], 'SH payload does not affect baked color' );

			} );

			QUnit.test( 'rejects unsupported versions', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();
				const buffer = createKSplatBuffer();
				const view = new DataView( buffer );
				view.setUint8( 0, 1 );

				assert.throws(
					() => loader.parse( buffer ),
					/Unsupported KSplat version 1\.1/,
					'unsupported version is rejected'
				);

			} );

			QUnit.test( 'rejects invalid byte lengths', ( assert ) => {

				const loader = new GaussianSplatKSplatLoader();
				const buffer = createKSplatBuffer();

				assert.throws(
					() => loader.parse( buffer.slice( 0, buffer.byteLength - 1 ) ),
					/Invalid KSplat byte length/,
					'invalid byte length is rejected'
				);

			} );

		} );

	} );

} );
