import { Box3, Matrix3, Matrix4, Plane, Vector3 } from 'three';
import { OBB } from '../../../../examples/jsm/math/OBB.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'OBB', () => {

		QUnit.test( 'intersectsPlane with translated boxes', ( assert ) => {

			for ( const x of [ - 10, 0, 10 ] ) {

				const box = new Box3( new Vector3( x - 1, - 2, - 3 ), new Vector3( x + 1, 2, 3 ) );
				const obb = new OBB().fromBox3( box );

				for ( const offset of [ - 2, - 1, 0, 1, 2 ] ) {

					const plane = new Plane( new Vector3( 1, 0, 0 ), - ( x + offset ) );
					const expected = Math.abs( offset ) <= 1;

					assert.strictEqual( obb.intersectsPlane( plane ), expected, `Box at ${x}, plane at ${x + offset}` );
					assert.strictEqual( obb.intersectsPlane( plane ), box.intersectsPlane( plane ), 'Matches the equivalent Box3' );
					assert.strictEqual( obb.intersectsPlane( plane.negate() ), expected, 'Reversing the normal preserves the result' );

				}

			}

		} );

		QUnit.test( 'intersectsPlane does not reflect the plane through the origin', ( assert ) => {

			const obb = new OBB( new Vector3( 10, 0, 0 ), new Vector3( 1, 2, 3 ) );
			const plane = new Plane( new Vector3( 1, 0, 0 ), 10 );

			assert.notOk( obb.intersectsPlane( plane ), 'The box at x = 10 does not intersect the plane at x = -10' );

		} );

		QUnit.test( 'intersectsPlane with a rotated box', ( assert ) => {

			const center = new Vector3( 10, 4, - 2 );
			const rotation = new Matrix3().setFromMatrix4( new Matrix4().makeRotationZ( Math.PI / 4 ) );
			const obb = new OBB( center, new Vector3( 1, 2, 3 ), rotation );
			const normal = new Vector3( 1, 0, 0 ).applyMatrix3( rotation );

			for ( const offset of [ - 2, 0, 2 ] ) {

				const point = center.clone().addScaledVector( normal, offset );
				const plane = new Plane().setFromNormalAndCoplanarPoint( normal, point );

				assert.strictEqual( obb.intersectsPlane( plane ), offset === 0, `Plane offset ${offset} along the box's local x axis` );

			}

		} );

	} );

} );
