import { BufferGeometry } from 'three';
import { KSPLATLoader } from '../../../../examples/jsm/loaders/KSPLATLoader.js';

const EPS = 1e-6;
const HEADER_SIZE_BYTES = 4096;
const SECTION_HEADER_SIZE_BYTES = 1024;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createKSPLATBuffer() {

	const compression = {
		bytesPerSplat: 44,
		scaleOffsetBytes: 12,
		rotationOffsetBytes: 24,
		colorOffsetBytes: 40,
		bucketBytes: 0
	};
	const buffer = new ArrayBuffer( HEADER_SIZE_BYTES + SECTION_HEADER_SIZE_BYTES + compression.bytesPerSplat );
	const view = new DataView( buffer );
	const bytes = new Uint8Array( buffer );
	const sectionOffset = HEADER_SIZE_BYTES;
	const dataOffset = HEADER_SIZE_BYTES + SECTION_HEADER_SIZE_BYTES;

	view.setUint8( 0, 0 );
	view.setUint8( 1, 1 );
	view.setUint32( 4, 1, true );
	view.setUint32( 8, 1, true );
	view.setUint32( 12, 1, true );
	view.setUint32( 16, 1, true );
	view.setUint16( 20, 0, true );

	view.setUint32( sectionOffset, 1, true );
	view.setUint32( sectionOffset + 4, 1, true );
	view.setUint32( sectionOffset + 8, 0, true );
	view.setUint32( sectionOffset + 12, 0, true );
	view.setFloat32( sectionOffset + 16, 4, true );
	view.setUint16( sectionOffset + 20, compression.bucketBytes, true );
	view.setUint32( sectionOffset + 24, 32767, true );
	view.setUint32( sectionOffset + 32, 0, true );
	view.setUint32( sectionOffset + 36, 0, true );
	view.setUint16( sectionOffset + 40, 0, true );

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

	bytes.set( [ 10, 20, 30, 40 ], dataOffset + compression.colorOffsetBytes );

	return buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'KSPLATLoader', () => {

			QUnit.test( 'parses uncompressed KSPLAT data', ( assert ) => {

				const loader = new KSPLATLoader();
				const data = loader.parse( createKSPLATBuffer() );

				const covariances = data.getAttribute( 'covariance' ).array;

				assert.ok( data instanceof BufferGeometry, 'returns BufferGeometry' );
				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, covariances[ 1 ], 0, 'covariance xy' );
				closeTo( assert, covariances[ 2 ], 0, 'covariance xz' );
				closeTo( assert, covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, covariances[ 4 ], 0, 'covariance yz' );
				closeTo( assert, covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 10, 20, 30, 40 ], 'colors' );

			} );

		} );

	} );

} );
