import { Box3, Matrix4, Ray, Sphere, Vector3 } from 'three';
import { OBB } from '../../../../examples/jsm/math/OBB.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'OBB', () => {

		QUnit.test( 'instantiation', ( assert ) => {

			const obb = new OBB();

			assert.ok( obb.center.equals( new Vector3( 0, 0, 0 ) ), 'Default center is (0, 0, 0)' );
			assert.ok( obb.halfSize.equals( new Vector3( 0, 0, 0 ) ), 'Default halfSize is (0, 0, 0)' );
			assert.strictEqual( obb.rotation.isMatrix3, true, 'Default rotation is Matrix3' );

		} );

		QUnit.test( 'set / copy / clone / equals', ( assert ) => {

			const center = new Vector3( 1, 2, 3 );
			const halfSize = new Vector3( 4, 5, 6 );
			const obb = new OBB( center, halfSize );

			const clone = obb.clone();
			assert.ok( obb.equals( clone ), 'clone equals original' );

			const copied = new OBB().copy( obb );
			assert.ok( obb.equals( copied ), 'copy equals original' );

		} );

		QUnit.test( 'clampPoint / containsPoint', ( assert ) => {

			const obb = new OBB( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );
			const target = new Vector3();

			assert.ok( obb.containsPoint( new Vector3( 0, 0, 0 ) ), 'Contains center' );
			assert.ok( obb.containsPoint( new Vector3( 1, 1, 1 ) ), 'Contains corner' );
			assert.notOk( obb.containsPoint( new Vector3( 2, 0, 0 ) ), 'Does not contain outside point' );

			obb.clampPoint( new Vector3( 2, 0, 0 ), target );
			assert.ok( target.equals( new Vector3( 1, 0, 0 ) ), 'Clamps outside point to boundary' );

		} );

		QUnit.test( 'applyMatrix4 (translation)', ( assert ) => {

			const obb = new OBB( new Vector3( 1, 2, 3 ), new Vector3( 2, 2, 2 ) );
			const m = new Matrix4().makeTranslation( 10, - 5, 2 );

			obb.applyMatrix4( m );

			assert.ok( obb.center.equals( new Vector3( 11, - 3, 5 ) ), 'Center correctly translated' );
			assert.ok( obb.halfSize.equals( new Vector3( 2, 2, 2 ) ), 'HalfSize unchanged by translation' );

		} );

		QUnit.test( 'applyMatrix4 (rotation with offset center)', ( assert ) => {

			const obb = new OBB( new Vector3( 0, 10, 0 ), new Vector3( 1, 2, 3 ) );
			const m = new Matrix4().makeRotationZ( Math.PI / 2 );

			obb.applyMatrix4( m );

			assert.ok( Math.abs( obb.center.x - ( - 10 ) ) < 1e-6, 'Center rotated to (-10, 0, 0)' );
			assert.ok( Math.abs( obb.center.y ) < 1e-6, 'Center y is ~0' );
			assert.strictEqual( obb.center.z, 0, 'Center z is 0' );
			assert.ok( obb.halfSize.equals( new Vector3( 1, 2, 3 ) ), 'HalfSize unchanged by rotation' );

		} );

		QUnit.test( 'applyMatrix4 (scale with offset center)', ( assert ) => {

			const obb = new OBB( new Vector3( 2, 3, 4 ), new Vector3( 1, 2, 3 ) );
			const m = new Matrix4().makeScale( 2, 3, 4 );

			obb.applyMatrix4( m );

			assert.ok( obb.center.equals( new Vector3( 4, 9, 16 ) ), 'Center scaled by matrix scale factors' );
			assert.ok( obb.halfSize.equals( new Vector3( 2, 6, 12 ) ), 'HalfSize scaled by matrix scale factors' );

		} );

		QUnit.test( 'applyMatrix4 (negative determinant)', ( assert ) => {

			const obb = new OBB( new Vector3( 1, 2, 3 ), new Vector3( 1, 1, 1 ) );
			const m = new Matrix4().makeScale( - 1, 1, 1 );

			obb.applyMatrix4( m );

			assert.ok( obb.center.equals( new Vector3( - 1, 2, 3 ) ), 'Center reflected across x axis' );
			assert.ok( obb.halfSize.equals( new Vector3( 1, 1, 1 ) ), 'HalfSize remains positive' );
			assert.ok( obb.containsPoint( new Vector3( - 1, 2, 3 ) ), 'Contains reflected center point' );

		} );

		QUnit.test( 'intersectsSphere / intersectsBox3 / intersectsRay', ( assert ) => {

			const obb = new OBB( new Vector3( 0, 0, 0 ), new Vector3( 1, 1, 1 ) );

			assert.ok( obb.intersectsSphere( new Sphere( new Vector3( 0, 0, 0 ), 1 ) ), 'Intersects overlapping sphere' );
			assert.notOk( obb.intersectsSphere( new Sphere( new Vector3( 5, 0, 0 ), 1 ) ), 'Does not intersect distant sphere' );

			assert.ok( obb.intersectsBox3( new Box3( new Vector3( - 0.5, - 0.5, - 0.5 ), new Vector3( 0.5, 0.5, 0.5 ) ) ), 'Intersects overlapping Box3' );
			assert.notOk( obb.intersectsBox3( new Box3( new Vector3( 2, 2, 2 ), new Vector3( 3, 3, 3 ) ) ), 'Does not intersect distant Box3' );

			const ray = new Ray( new Vector3( 0, 0, 5 ), new Vector3( 0, 0, - 1 ) );
			const target = new Vector3();
			assert.ok( obb.intersectsRay( ray ), 'Intersects ray pointing at it' );
			assert.ok( obb.intersectRay( ray, target ), 'Computes ray intersection point' );
			assert.ok( target.equals( new Vector3( 0, 0, 1 ) ), 'Intersection point is (0, 0, 1)' );

		} );

	} );

} );

