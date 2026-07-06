import {
	BufferAttribute,
	BufferGeometry
} from 'three';

import { PLYLoader } from '../../../../examples/jsm/loaders/PLYLoader.js';

import {
	GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING,
	createGaussianSplatGeometryFromPLYGeometry,
	decomposeCovariance,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeCovariance
} from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'GaussianSplatUtils', () => {

			QUnit.test( 'converts degree-0 spherical harmonics and linear color', ( assert ) => {

				closeTo( assert, sh0ToLinear( 0 ), 0.5, 'zero coefficient maps to biased half' );
				closeTo( assert, linearToSH0( 0.5 ), 0, 'biased half maps to zero coefficient' );
				closeTo( assert, sh0ToLinear( linearToSH0( 0.25 ) ), 0.25, 'color round-trips through SH0' );

			} );

			QUnit.test( 'applies sigmoid activation', ( assert ) => {

				closeTo( assert, sigmoid( 0 ), 0.5, 'zero maps to half' );
				closeTo( assert, sigmoid( Math.log( 3 ) ), 0.75, 'logit maps to expected value' );

			} );

			QUnit.test( 'converts PLY geometry attributes into Gaussian splat geometry', ( assert ) => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 3 ) );
				geometry.setAttribute( 'scale', new BufferAttribute( new Float32Array( [ Math.log( 2 ), Math.log( 3 ), Math.log( 4 ) ] ), 3 ) );
				geometry.setAttribute( 'rotation', new BufferAttribute( new Float32Array( [ 1, 0, 0, 0 ] ), 4 ) );
				geometry.setAttribute( 'f_dc', new BufferAttribute( new Float32Array( [ 0, 0, 0 ] ), 3 ) );
				geometry.setAttribute( 'opacity', new BufferAttribute( new Float32Array( [ 0 ] ), 1 ) );

				const data = createGaussianSplatGeometryFromPLYGeometry( geometry );
				const covariances = data.getAttribute( 'covariance' ).array;

				assert.strictEqual( data.getAttribute( 'position' ).count, 1, 'count' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, covariances[ 1 ], 0, 'covariance xy' );
				closeTo( assert, covariances[ 2 ], 0, 'covariance xz' );
				closeTo( assert, covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, covariances[ 4 ], 0, 'covariance yz' );
				closeTo( assert, covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 128 ], 'degree-0 color and opacity' );

			} );

			QUnit.test( 'converts generic PLYLoader output into Gaussian splat geometry', ( assert ) => {

				const ply = [
					'ply',
					'format ascii 1.0',
					'element vertex 1',
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
					'property float opacity',
					'end_header',
					`1 2 3 ${ Math.log( 2 ) } ${ Math.log( 3 ) } ${ Math.log( 4 ) } 1 0 0 0 0 0 0 0`
				].join( '\n' );

				const loader = new PLYLoader();
				loader.setCustomPropertyNameMapping( GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING );

				const geometry = loader.parse( ply );
				const data = createGaussianSplatGeometryFromPLYGeometry( geometry );
				const covariances = data.getAttribute( 'covariance' ).array;

				assert.strictEqual( geometry.getAttribute( 'scale' ).itemSize, 3, 'PLYLoader preserves scale custom properties' );
				assert.strictEqual( geometry.getAttribute( 'rotation' ).itemSize, 4, 'PLYLoader preserves rotation custom properties' );
				assert.deepEqual( Array.from( data.getAttribute( 'position' ).array ), [ 1, 2, 3 ], 'centers' );
				closeTo( assert, covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 9, 'covariance yy' );
				closeTo( assert, covariances[ 5 ], 16, 'covariance zz' );
				assert.deepEqual( Array.from( data.getAttribute( 'color' ).array ), [ 128, 128, 128, 128 ], 'degree-0 color and opacity' );

			} );

			QUnit.test( 'rejects incomplete PLY geometry attributes', ( assert ) => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( [ 1, 2, 3 ] ), 3 ) );

				assert.throws(
					() => createGaussianSplatGeometryFromPLYGeometry( geometry ),
					/requires position, scale, rotation, f_dc and opacity attributes/,
					'missing custom attributes are rejected'
				);

			} );

			QUnit.test( 'decomposes covariance into scale and rotation', ( assert ) => {

				const covariance = new Float32Array( 6 );
				const scales = new Float32Array( 3 );
				const rotations = new Float32Array( 4 );
				const roundTrip = new Float32Array( 6 );

				writeCovariance( covariance, 0, 2, 3, 4, 0, 0, 0, 1 );
				decomposeCovariance( covariance, 0, scales, rotations, 0 );
				writeCovariance( roundTrip, 0, scales[ 0 ], scales[ 1 ], scales[ 2 ], rotations[ 0 ], rotations[ 1 ], rotations[ 2 ], rotations[ 3 ] );

				closeTo( assert, roundTrip[ 0 ], covariance[ 0 ], 'xx covariance' );
				closeTo( assert, roundTrip[ 1 ], covariance[ 1 ], 'xy covariance' );
				closeTo( assert, roundTrip[ 2 ], covariance[ 2 ], 'xz covariance' );
				closeTo( assert, roundTrip[ 3 ], covariance[ 3 ], 'yy covariance' );
				closeTo( assert, roundTrip[ 4 ], covariance[ 4 ], 'yz covariance' );
				closeTo( assert, roundTrip[ 5 ], covariance[ 5 ], 'zz covariance' );

			} );

		} );

	} );

} );
