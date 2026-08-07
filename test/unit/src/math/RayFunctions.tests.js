import {
	rayApplyMatrix4,
	rayAt,
	rayClosestPointToPoint,
	rayCopy,
	rayCreate,
	rayDistanceSqToPoint,
	rayDistanceSqToSegment,
	rayDistanceToPoint,
	rayEquals,
	rayIntersectBox,
	rayIntersectPlane,
	rayIntersectSphere,
	rayIntersectTriangle,
	rayIntersectsBox,
	rayIntersectsPlane,
	rayIntersectsSphere,
	rayLookAt,
	rayRecast,
	raySet
} from '../../../../src/math/RayFunctions.js';
import { Ray } from '../../../../src/math/Ray.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { eps } from '../../utils/math-constants.js';

function vec3Distance( a, b ) {

	const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
	return Math.sqrt( dx * dx + dy * dy + dz * dz );

}

function vec3Equals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'RayFunctions', () => {

		QUnit.test( 'rayCreate is a plain RayLike, not a Ray instance', ( assert ) => {

			const ray = rayCreate();

			assert.strictEqual( ray.origin.x, 0, 'origin.x is 0' );
			assert.strictEqual( ray.origin.y, 0, 'origin.y is 0' );
			assert.strictEqual( ray.origin.z, 0, 'origin.z is 0' );
			assert.strictEqual( ray.direction.x, 0, 'direction.x is 0' );
			assert.strictEqual( ray.direction.y, 0, 'direction.y is 0' );
			assert.strictEqual( ray.direction.z, - 1, 'direction.z is -1' );
			assert.notOk( ray.isRay, 'is not branded as a Ray' );
			assert.ok( rayEquals( ray, new Ray() ), 'is numerically a default Ray' );

		} );

		QUnit.test( 'operations work on plain objects without importing Ray', ( assert ) => {

			const ray = raySet(
				{ x: 1, y: 1, z: 1 },
				{ x: 0, y: 0, z: 1 }
			);

			const point = rayAt( ray, 2 );
			assert.ok( ! point.isVector3, 'result is a plain Vector3Like' );
			assert.ok( vec3Equals( point, { x: 1, y: 1, z: 3 } ), 'at() matches expected position' );

			const closest = rayClosestPointToPoint( ray, { x: 0, y: 0, z: 50 } );
			assert.ok( vec3Equals( closest, { x: 1, y: 1, z: 50 } ), 'closestPointToPoint matches expected' );

			assert.strictEqual( rayDistanceSqToPoint( ray, { x: 0, y: 0, z: 50 } ), 2, 'distanceSqToPoint matches' );
			assert.strictEqual( rayDistanceToPoint( ray, { x: 0, y: 0, z: 0 } ), Math.sqrt( 3 ), 'distanceToPoint matches' );

		} );

		QUnit.test( 'omitting the target allocates a new RayLike, providing one reuses it', ( assert ) => {

			const source = raySet( { x: 1, y: 2, z: 3 }, { x: 0, y: 1, z: 0 } );

			const allocated = rayCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( rayEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = rayCreate();
			const returned = rayCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( rayEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'recast / lookAt are safe when the target aliases the input', ( assert ) => {

			const ray = raySet( { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 1 } );

			const expectedRecast = rayRecast( ray, 2 );
			const aliasedRecast = rayCopy( ray );
			rayRecast( aliasedRecast, 2, aliasedRecast );
			assert.ok( rayEquals( aliasedRecast, expectedRecast ), 'in-place recast matches out-of-place' );

			const expectedLookAt = rayLookAt( ray, { x: 4, y: 1, z: 1 } );
			const aliasedLookAt = rayCopy( ray );
			rayLookAt( aliasedLookAt, { x: 4, y: 1, z: 1 }, aliasedLookAt );
			assert.ok( rayEquals( aliasedLookAt, expectedLookAt ), 'in-place lookAt matches out-of-place' );

		} );

		QUnit.test( 'applyMatrix4 is safe when the target aliases the input', ( assert ) => {

			const ray = raySet( { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 1 } );
			const m = {
				elements: [
					1, 0, 0, 0,
					0, - 1, 0, 0,
					0, 0, - 1, 0,
					0, 0, 0, 1
				]
			};

			const expected = rayApplyMatrix4( ray, m );
			const aliased = rayCopy( ray );
			rayApplyMatrix4( aliased, m, aliased );

			assert.ok( vec3Equals( aliased.origin, expected.origin ), 'in-place origin matches' );
			assert.ok( vec3Equals( aliased.direction, expected.direction ), 'in-place direction matches' );

			const classRay = new Ray( new Vector3( 0, 0, 1 ), new Vector3( 0, 0, 1 ) );
			classRay.applyMatrix4( new Matrix4().makeRotationX( Math.PI ) );
			assert.ok( vec3Distance( aliased.origin, classRay.origin ) < eps, 'origin matches the class' );
			assert.ok( vec3Distance( aliased.direction, classRay.direction ) < eps, 'direction matches the class' );

		} );

		QUnit.test( 'intersectSphere / intersectsSphere on plain SphereLike objects', ( assert ) => {

			const ray = raySet( { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: - 1 } );
			const sphere = { center: { x: 0, y: 0, z: - 2 }, radius: 1 };

			const hit = rayIntersectSphere( ray, sphere );
			assert.ok( hit !== null, 'intersection found' );
			assert.ok( vec3Equals( hit, { x: 0, y: 0, z: - 1 } ), 'hit point is correct' );
			assert.ok( rayIntersectsSphere( ray, sphere ), 'intersectsSphere is true' );

			const empty = { center: { x: 0, y: 0, z: - 1 }, radius: - 1 };
			assert.strictEqual( rayIntersectSphere( ray, empty, { x: 9, y: 9, z: 9 } ), null, 'empty sphere returns null' );
			assert.ok( ! rayIntersectsSphere( ray, empty ), 'empty sphere is not intersected' );

		} );

		QUnit.test( 'intersectPlane / intersectsPlane on plain PlaneLike objects', ( assert ) => {

			const ray = raySet( { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 1 } );
			const plane = { normal: { x: 0, y: 0, z: 1 }, constant: - 1 };

			const hit = rayIntersectPlane( ray, plane );
			assert.ok( hit !== null, 'intersection found' );
			assert.ok( vec3Equals( hit, { x: 1, y: 1, z: 1 } ), 'hit is at the origin (already on plane)' );
			assert.ok( rayIntersectsPlane( ray, plane ), 'intersectsPlane is true' );

			const behind = { normal: { x: 0, y: 0, z: 1 }, constant: 1 };
			assert.strictEqual( rayIntersectPlane( ray, behind ), null, 'plane behind the ray returns null' );
			assert.ok( ! rayIntersectsPlane( ray, behind ), 'plane behind the ray is not intersected' );

		} );

		QUnit.test( 'intersectBox / intersectsBox on plain Box3Like objects', ( assert ) => {

			const box = { min: { x: - 1, y: - 1, z: - 1 }, max: { x: 1, y: 1, z: 1 } };
			const ray = raySet( { x: - 2, y: 0, z: 0 }, { x: 1, y: 0, z: 0 } );

			assert.ok( rayIntersectsBox( ray, box ), 'intersects from the left' );
			const hit = rayIntersectBox( ray, box );
			assert.ok( vec3Equals( hit, { x: - 1, y: 0, z: 0 } ), 'entry point is correct' );

			const away = raySet( { x: - 2, y: 0, z: 0 }, { x: - 1, y: 0, z: 0 } );
			assert.ok( ! rayIntersectsBox( away, box ), 'misses when pointing away' );
			assert.strictEqual( rayIntersectBox( away, box ), null, 'intersectBox returns null when pointing away' );

		} );

		QUnit.test( 'intersectTriangle on plain Vector3Like vertices', ( assert ) => {

			const ray = raySet( { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 } );
			const a = { x: 1, y: 1, z: 0 };
			const b = { x: 0, y: 1, z: 1 };
			const c = { x: 1, y: 0, z: 1 };

			const hit = rayIntersectTriangle( ray, a, b, c, false );
			assert.ok( hit !== null, 'intersection found' );
			assert.ok( Math.abs( hit.x - 2 / 3 ) <= eps, 'x is correct' );
			assert.ok( Math.abs( hit.y - 2 / 3 ) <= eps, 'y is correct' );
			assert.ok( Math.abs( hit.z - 2 / 3 ) <= eps, 'z is correct' );

			assert.strictEqual(
				rayIntersectTriangle( ray, a, b, c, true ),
				null,
				'backface culling rejects the hit'
			);

			const zeroDir = raySet( { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 } );
			assert.strictEqual(
				rayIntersectTriangle( zeroDir, a, b, c, false ),
				null,
				'zero direction cannot intersect'
			);

		} );

		QUnit.test( 'distanceSqToSegment on plain objects', ( assert ) => {

			const ray = raySet( { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 1 } );
			const ptOnRay = { x: 0, y: 0, z: 0 };
			const ptOnSeg = { x: 0, y: 0, z: 0 };

			const distSqr = rayDistanceSqToSegment(
				ray,
				{ x: 3, y: 5, z: 50 },
				{ x: 50, y: 50, z: 50 },
				ptOnRay,
				ptOnSeg
			);

			assert.ok( vec3Distance( ptOnSeg, { x: 3, y: 5, z: 50 } ) < 0.0001, 'closest segment point' );
			assert.ok( vec3Distance( ptOnRay, { x: 1, y: 1, z: 50 } ) < 0.0001, 'closest ray point' );
			assert.ok( Math.abs( distSqr - 20 ) < 0.0001, 'squared distance is 20' );

		} );

		QUnit.test( 'set / equals round-trip', ( assert ) => {

			const a = raySet( { x: 2, y: 3, z: 4 }, { x: 0, y: 1, z: 0 } );
			const b = rayCreate();

			assert.ok( ! rayEquals( a, b ), 'different rays are not equal' );

			raySet( a.origin, a.direction, b );
			assert.ok( rayEquals( a, b ), 'set makes them equal' );

		} );

	} );

} );
