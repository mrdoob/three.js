import { GaussianSplatData } from '../../../../examples/jsm/objects/GaussianSplatData.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Objects', () => {

		QUnit.module( 'GaussianSplatData', () => {

			QUnit.test( 'constructs from typed arrays and computes bounds', ( assert ) => {

				const centers = new Float32Array( [
					- 1, - 2, - 3,
					3, 2, 1
				] );
				const covariances = new Float32Array( 12 );
				const colors = new Uint8Array( 8 );
				const data = new GaussianSplatData( { centers, covariances, colors } );

				assert.strictEqual( data.count, 2, 'count is inferred from centers' );
				assert.strictEqual( data.centers, centers, 'stores center array by reference' );
				assert.strictEqual( data.covariances, covariances, 'stores covariance array by reference' );
				assert.strictEqual( data.colors, colors, 'stores color array by reference' );
				assert.deepEqual( data.boundingBox.min.toArray(), [ - 1, - 2, - 3 ], 'bounding box min' );
				assert.deepEqual( data.boundingBox.max.toArray(), [ 3, 2, 1 ], 'bounding box max' );
				assert.deepEqual( data.boundingSphere.center.toArray(), [ 1, 0, - 1 ], 'bounding sphere center' );
				closeTo( assert, data.boundingSphere.radius, Math.sqrt( 12 ), 'bounding sphere radius' );

			} );

			QUnit.test( 'recomputes bounds after center data changes', ( assert ) => {

				const data = new GaussianSplatData( {
					centers: new Float32Array( [
						0, 0, 0,
						1, 1, 1
					] ),
					covariances: new Float32Array( 12 ),
					colors: new Uint8Array( 8 )
				} );

				data.centers.set( [
					2, 3, 4,
					6, 7, 8
				] );

				assert.strictEqual( data.computeBounds(), data, 'returns self' );
				assert.deepEqual( data.boundingBox.min.toArray(), [ 2, 3, 4 ], 'updated bounding box min' );
				assert.deepEqual( data.boundingBox.max.toArray(), [ 6, 7, 8 ], 'updated bounding box max' );
				assert.deepEqual( data.boundingSphere.center.toArray(), [ 4, 5, 6 ], 'updated bounding sphere center' );

			} );

			QUnit.test( 'requires centers, covariances and colors', ( assert ) => {

				assert.throws(
					() => new GaussianSplatData(),
					/centers, covariances and colors are required/,
					'missing arrays throw'
				);

			} );

			QUnit.test( 'validates typed array lengths', ( assert ) => {

				const validCenters = new Float32Array( 3 );
				const validCovariances = new Float32Array( 6 );
				const validColors = new Uint8Array( 4 );

				assert.throws(
					() => new GaussianSplatData( {
						centers: new Float32Array( 4 ),
						covariances: validCovariances,
						colors: validColors,
						count: 1
					} ),
					/Invalid centers length/,
					'invalid centers length throws'
				);

				assert.throws(
					() => new GaussianSplatData( {
						centers: validCenters,
						covariances: new Float32Array( 7 ),
						colors: validColors,
						count: 1
					} ),
					/Invalid covariances length/,
					'invalid covariances length throws'
				);

				assert.throws(
					() => new GaussianSplatData( {
						centers: validCenters,
						covariances: validCovariances,
						colors: new Uint8Array( 5 ),
						count: 1
					} ),
					/Invalid colors length/,
					'invalid colors length throws'
				);

			} );

		} );

	} );

} );
