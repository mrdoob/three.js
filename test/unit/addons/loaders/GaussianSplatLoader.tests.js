import { GaussianSplatLoader } from '../../../../examples/jsm/loaders/GaussianSplatLoader.js';
import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function createSplatBuffer( { rotation = [ 128, 128, 128, 128 ] } = {} ) {

	const buffer = new ArrayBuffer( 32 );
	const view = new DataView( buffer );
	const bytes = new Uint8Array( buffer );

	view.setFloat32( 0, 1, true );
	view.setFloat32( 4, 2, true );
	view.setFloat32( 8, 3, true );
	view.setFloat32( 12, 2, true );
	view.setFloat32( 16, 3, true );
	view.setFloat32( 20, 4, true );

	bytes.set( [ 10, 20, 30, 40 ], 24 );
	bytes.set( rotation, 28 );

	return buffer;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GaussianSplatLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GaussianSplatLoader();

				assert.ok( loader instanceof GaussianSplatLoader, 'Can instantiate a GaussianSplatLoader.' );

			} );

			QUnit.test( 'parses fixed-width .splat data', ( assert ) => {

				const loader = new GaussianSplatLoader();
				const data = loader.parse( createSplatBuffer() );

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

			QUnit.test( 'uses quaternion byte order w, x, y, z', ( assert ) => {

				const loader = new GaussianSplatLoader();
				const data = loader.parse( createSplatBuffer( { rotation: [ 219, 219, 128, 128 ] } ) );

				closeTo( assert, data.covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, data.covariances[ 3 ], 16, 'covariance yy after x rotation' );
				closeTo( assert, data.covariances[ 5 ], 9, 'covariance zz after x rotation' );

			} );

			QUnit.test( 'rejects invalid byte lengths', ( assert ) => {

				const loader = new GaussianSplatLoader();

				assert.throws(
					() => loader.parse( new ArrayBuffer( 31 ) ),
					/Invalid \.splat byte length/,
					'invalid byte length is rejected'
				);

			} );

		} );

	} );

} );
