import { BufferGeometry } from 'three';

import { PLYGaussianSplatLoader } from '../../../../examples/jsm/loaders/PLYGaussianSplatLoader.js';
import { unpackSphericalHarmonicsBand } from '../utils/GaussianSplatTestUtils.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createGaussianSplatPLY( shRestCoefficientCount = 0 ) {

	const properties = [
		'property float x',
		'property float y',
		'property float z',
		'property float scale_0',
		'property float scale_1',
		'property float scale_2',
		'property float rot_0',
		'property float rot_1',
		'property float rot_2',
		'property float rot_3',
		'property float f_dc_0',
		'property float f_dc_1',
		'property float f_dc_2',
		'property float opacity'
	];

	for ( let i = 0; i < shRestCoefficientCount; i ++ ) {

		properties.push( `property float f_rest_${ i }` );

	}

	const values = [
		1, 2, 3,
		Math.log( 2 ), Math.log( 3 ), Math.log( 4 ),
		1, 0, 0, 0,
		0, 0, 0,
		0
	];

	for ( let i = 0; i < shRestCoefficientCount; i ++ ) {

		values.push( i / 128 );

	}

	return [
		'ply',
		'format ascii 1.0',
		'element vertex 1',
		...properties,
		'end_header',
		values.join( ' ' )
	].join( '\n' );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'PLYGaussianSplatLoader', () => {

			QUnit.test( 'parses a Gaussian splat PLY with no spherical harmonics', ( assert ) => {

				const loader = new PLYGaussianSplatLoader();
				const data = loader.parse( createGaussianSplatPLY() );
				const covariances = data.getAttribute( 'covariance' ).array;

				assert.ok( data instanceof BufferGeometry, 'returns BufferGeometry' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 128 ], 'degree-0 color and opacity' );

			} );

			QUnit.test( 'detects spherical harmonics degree from the header and converts f_rest', ( assert ) => {

				const loader = new PLYGaussianSplatLoader();
				const data = loader.parse( createGaussianSplatPLY( 9 ) );

				assert.deepEqual(
					Array.from( unpackSphericalHarmonicsBand( data.getAttribute( 'sphericalHarmonics1' ).array, 1, 1 ) ),
					[ 128, 131, 134, 129, 132, 135, 130, 133, 136 ],
					'channel-blocked coefficients are remapped to RGB triplets'
				);

			} );

			QUnit.test( 'requires no pre-setup for each supported spherical harmonics degree', ( assert ) => {

				const loader = new PLYGaussianSplatLoader();

				for ( const [ degree, count ] of [[ 0, 0 ], [ 1, 9 ], [ 2, 24 ], [ 3, 45 ]] ) {

					const data = loader.parse( createGaussianSplatPLY( count ) );
					assert.strictEqual( data.getAttribute( 'position' ).count, 1, `degree ${ degree } parses` );

				}

			} );

			QUnit.test( 'rejects an unsupported number of f_rest coefficients', ( assert ) => {

				const loader = new PLYGaussianSplatLoader();

				assert.throws(
					() => loader.parse( createGaussianSplatPLY( 5 ) ),
					/Unsupported number of f_rest spherical harmonics coefficients/,
					'non-table f_rest counts are rejected'
				);

			} );

			QUnit.test( 'rejects PLY data missing required Gaussian splat properties', ( assert ) => {

				const ply = [
					'ply',
					'format ascii 1.0',
					'element vertex 1',
					'property float x',
					'property float y',
					'property float z',
					'end_header',
					'1 2 3'
				].join( '\n' );

				const loader = new PLYGaussianSplatLoader();

				assert.throws(
					() => loader.parse( ply ),
					/requires position, scale, rotation, f_dc and opacity properties/,
					'missing properties are rejected'
				);

			} );

		} );

	} );

} );
