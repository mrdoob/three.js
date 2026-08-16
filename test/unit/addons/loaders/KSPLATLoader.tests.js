import { BufferGeometry } from 'three';
import { KSPLATLoader } from '../../../../examples/jsm/loaders/KSPLATLoader.js';
import { unpackSphericalHarmonicsBand } from '../utils/GaussianSplatTestUtils.js';

const EPS = 1e-6;
const HEADER_SIZE_BYTES = 4096;
const SECTION_HEADER_SIZE_BYTES = 1024;
const SH_DEGREE_TO_COMPONENTS = [ 0, 9, 24, 45 ];

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createKSPLATBuffer( sphericalHarmonicsDegree = 0 ) {

	const degrees = Array.isArray( sphericalHarmonicsDegree ) ? sphericalHarmonicsDegree : [ sphericalHarmonicsDegree ];
	const bytesPerSplat = degrees.map( degree => 44 + SH_DEGREE_TO_COMPONENTS[ degree ] * 4 );
	const sectionHeadersSize = SECTION_HEADER_SIZE_BYTES * degrees.length;
	const buffer = new ArrayBuffer( HEADER_SIZE_BYTES + sectionHeadersSize + bytesPerSplat.reduce( ( sum, size ) => sum + size, 0 ) );
	const view = new DataView( buffer );
	const bytes = new Uint8Array( buffer );

	view.setUint8( 0, 0 );
	view.setUint8( 1, 1 );
	view.setUint32( 4, degrees.length, true );
	view.setUint32( 8, degrees.length, true );
	view.setUint32( 12, degrees.length, true );
	view.setUint32( 16, degrees.length, true );
	view.setUint16( 20, 0, true );

	let dataOffset = HEADER_SIZE_BYTES + sectionHeadersSize;

	for ( let sectionIndex = 0; sectionIndex < degrees.length; sectionIndex ++ ) {

		const degree = degrees[ sectionIndex ];
		const sectionOffset = HEADER_SIZE_BYTES + sectionIndex * SECTION_HEADER_SIZE_BYTES;

		view.setUint32( sectionOffset, 1, true );
		view.setUint32( sectionOffset + 4, 1, true );
		view.setUint32( sectionOffset + 8, 0, true );
		view.setUint32( sectionOffset + 12, 0, true );
		view.setFloat32( sectionOffset + 16, 4, true );
		view.setUint16( sectionOffset + 20, 0, true );
		view.setUint32( sectionOffset + 24, 32767, true );
		view.setUint32( sectionOffset + 32, 0, true );
		view.setUint32( sectionOffset + 36, 0, true );
		view.setUint16( sectionOffset + 40, degree, true );

		view.setFloat32( dataOffset, sectionIndex + 1, true );
		view.setFloat32( dataOffset + 4, 2, true );
		view.setFloat32( dataOffset + 8, 3, true );
		view.setFloat32( dataOffset + 12, 2, true );
		view.setFloat32( dataOffset + 16, 3, true );
		view.setFloat32( dataOffset + 20, 4, true );
		view.setFloat32( dataOffset + 24, 1, true );
		view.setFloat32( dataOffset + 28, 0, true );
		view.setFloat32( dataOffset + 32, 0, true );
		view.setFloat32( dataOffset + 36, 0, true );
		bytes.set( [ 10, 20, 30, 40 ], dataOffset + 40 );

		for ( let i = 0; i < SH_DEGREE_TO_COMPONENTS[ degree ]; i ++ ) {

			view.setFloat32( dataOffset + 44 + i * 4, ( i + 1 ) / 128, true );

		}

		dataOffset += bytesPerSplat[ sectionIndex ];

	}

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

			QUnit.test( 'parses uncompressed KSPLAT spherical harmonics data', ( assert ) => {

				const loader = new KSPLATLoader();
				const data = loader.parse( createKSPLATBuffer( 1 ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 1, 1 ) ), [ 129, 132, 135, 130, 133, 136, 131, 134, 137 ], 'SH1 coefficients are remapped to RGB triplets' );

			} );

			QUnit.test( 'initializes missing KSPLAT spherical harmonics coefficients to zero', ( assert ) => {

				const loader = new KSPLATLoader();
				const data = loader.parse( createKSPLATBuffer( [ 0, 1 ] ) );

				assert.deepEqual( Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 2, 1 ) ), [
					128, 128, 128, 128, 128, 128, 128, 128, 128,
					129, 132, 135, 130, 133, 136, 131, 134, 137
				], 'missing SH1 coefficients remain neutral' );

			} );

		} );

	} );

} );
