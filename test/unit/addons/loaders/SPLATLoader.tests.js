import { BufferGeometry } from 'three';
import { SPLATLoader } from '../../../../examples/jsm/loaders/SPLATLoader.js';

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

		QUnit.module( 'SPLATLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new SPLATLoader();

				assert.ok( loader instanceof SPLATLoader, 'Can instantiate a SPLATLoader.' );

			} );

			QUnit.test( 'parses fixed-width .splat data', ( assert ) => {

				const loader = new SPLATLoader();
				const data = loader.parse( createSplatBuffer() );

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

			QUnit.test( 'uses quaternion byte order w, x, y, z', ( assert ) => {

				const loader = new SPLATLoader();
				const data = loader.parse( createSplatBuffer( { rotation: [ 219, 219, 128, 128 ] } ) );
				const covariances = data.getAttribute( 'covariance' ).array;

				closeTo( assert, covariances[ 0 ], 4, 'covariance xx' );
				closeTo( assert, covariances[ 3 ], 16, 'covariance yy after x rotation' );
				closeTo( assert, covariances[ 5 ], 9, 'covariance zz after x rotation' );

			} );

			QUnit.test( 'rejects invalid byte lengths', ( assert ) => {

				const loader = new SPLATLoader();

				assert.throws(
					() => loader.parse( new ArrayBuffer( 31 ) ),
					/Invalid \.splat byte length/,
					'invalid byte length is rejected'
				);

			} );

		} );

	} );

} );
