import {
	sphereApplyMatrix4,
	sphereClampPoint,
	sphereContainsPoint,
	sphereCopy,
	sphereCreate,
	sphereDistanceToPoint,
	sphereEquals,
	sphereExpandByPoint,
	sphereFromJSON,
	sphereGetBoundingBox,
	sphereIntersectsBox,
	sphereIntersectsPlane,
	sphereIntersectsSphere,
	sphereIsEmpty,
	sphereMakeEmpty,
	sphereSet,
	sphereSetFromPoints,
	sphereToJSON,
	sphereTranslate,
	sphereUnion
} from '../../../../src/math/SphereFunctions.js';
import { Sphere } from '../../../../src/math/Sphere.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { eps } from '../../utils/math-constants.js';

function sphereLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.center.x - b.center.x ) <= tolerance &&
		Math.abs( a.center.y - b.center.y ) <= tolerance &&
		Math.abs( a.center.z - b.center.z ) <= tolerance &&
		Math.abs( a.radius - b.radius ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphereFunctions', () => {

		QUnit.test( 'sphereCreate is a plain SphereLike, not a Sphere instance', ( assert ) => {

			const s = sphereCreate();

			assert.strictEqual( s.center.x, 0, 'center.x is 0' );
			assert.strictEqual( s.center.y, 0, 'center.y is 0' );
			assert.strictEqual( s.center.z, 0, 'center.z is 0' );
			assert.strictEqual( s.radius, - 1, 'radius is -1' );
			assert.notOk( s.isSphere, 'is not branded as a Sphere' );
			assert.ok( sphereLikeEquals( s, new Sphere() ), 'matches new Sphere() numerically' );

		} );

		QUnit.test( 'operations work on plain objects without importing Sphere', ( assert ) => {

			const a = sphereSet( { x: 1, y: 2, z: 3 }, 4 );
			const b = sphereTranslate( a, { x: - 1, y: - 2, z: - 3 } );

			assert.ok( ! a.isSphere, 'set result is a plain SphereLike' );
			assert.ok( ! b.isSphere, 'translate result is a plain SphereLike' );
			assert.ok( sphereLikeEquals( b, { center: { x: 0, y: 0, z: 0 }, radius: 4 } ), 'translate matches expected' );
			assert.ok( sphereContainsPoint( a, { x: 1, y: 2, z: 3 } ), 'contains its own center' );
			assert.notOk( sphereContainsPoint( a, { x: 10, y: 10, z: 10 } ), 'rejects a far point' );

		} );

		QUnit.test( 'omitting the target allocates a new SphereLike, providing one reuses it', ( assert ) => {

			const source = sphereSet( { x: 1, y: 0, z: 0 }, 2 );

			const allocated = sphereCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( sphereLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = sphereCreate();
			const returned = sphereCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( sphereLikeEquals( reused, source ), 'the reused target matches the source' );

		} );

		QUnit.test( 'sphereSet / sphereCopy / sphereEquals', ( assert ) => {

			const a = sphereSet( { x: 1, y: 2, z: 3 }, 5 );
			const b = sphereCopy( a );

			assert.ok( sphereEquals( a, b ), 'copy equals source' );
			assert.notOk( sphereEquals( a, sphereCreate() ), 'differs from empty' );

			b.radius = 7;
			assert.notOk( sphereEquals( a, b ), 'mutation of copy does not affect equality with source' );

		} );

		QUnit.test( 'sphereSetFromPoints matches Sphere.setFromPoints', ( assert ) => {

			const points = [
				{ x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
				{ x: 0.8660253882408142, y: 0.5, z: 0 },
				{ x: 0, y: 0.5, z: 0.8660253882408142 },
				{ x: 0, y: - 1, z: 0 }
			];

			const functional = sphereSetFromPoints( points );
			const classic = new Sphere().setFromPoints( points.map( ( p ) => new Vector3( p.x, p.y, p.z ) ) );

			assert.ok( sphereLikeEquals( functional, classic ), 'default center matches class' );

			const optionalCenter = { x: 1, y: 1, z: 1 };
			const functionalOpt = sphereSetFromPoints( points, optionalCenter );
			const classicOpt = new Sphere().setFromPoints(
				points.map( ( p ) => new Vector3( p.x, p.y, p.z ) ),
				new Vector3( 1, 1, 1 )
			);

			assert.ok( sphereLikeEquals( functionalOpt, classicOpt ), 'optional center matches class' );

		} );

		QUnit.test( 'sphereIsEmpty / sphereMakeEmpty', ( assert ) => {

			assert.ok( sphereIsEmpty( sphereCreate() ), 'default is empty' );
			assert.notOk( sphereIsEmpty( sphereSet( { x: 0, y: 0, z: 0 }, 0 ) ), 'zero radius is not empty' );
			assert.ok( sphereIsEmpty( sphereMakeEmpty() ), 'makeEmpty is empty' );

		} );

		QUnit.test( 'sphereDistanceToPoint / sphereIntersectsSphere', ( assert ) => {

			const a = sphereSet( { x: 1, y: 1, z: 1 }, 1 );
			const b = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			const c = sphereSet( { x: 0, y: 0, z: 0 }, 0.25 );

			assert.ok( Math.abs( sphereDistanceToPoint( a, { x: 0, y: 0, z: 0 } ) - 0.7320 ) < 0.001, 'distance' );
			assert.strictEqual( sphereDistanceToPoint( a, { x: 1, y: 1, z: 1 } ), - 1, 'distance to center' );
			assert.ok( sphereIntersectsSphere( a, b ), 'intersecting spheres' );
			assert.notOk( sphereIntersectsSphere( a, c ), 'non-intersecting spheres' );

		} );

		QUnit.test( 'sphereIntersectsBox / sphereIntersectsPlane', ( assert ) => {

			const unit = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			const far = sphereSet( { x: - 5, y: - 5, z: - 5 }, 1 );
			const box = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };

			assert.strictEqual( sphereIntersectsBox( unit, box ), true, 'unit sphere intersects box' );
			assert.strictEqual( sphereIntersectsBox( far, box ), false, 'far sphere misses box' );
			assert.strictEqual(
				sphereIntersectsBox( unit, box ),
				new Sphere( new Vector3(), 1 ).intersectsBox( new Box3( new Vector3(), new Vector3( 1, 1, 1 ) ) ),
				'matches class intersectsBox'
			);

			const planeHit = { normal: { x: 0, y: 1, z: 0 }, constant: 1 };
			const planeMiss = { normal: { x: 0, y: 1, z: 0 }, constant: 1.25 };

			assert.ok( sphereIntersectsPlane( unit, planeHit ), 'intersects plane' );
			assert.notOk( sphereIntersectsPlane( unit, planeMiss ), 'misses plane' );
			assert.strictEqual(
				sphereIntersectsPlane( unit, planeHit ),
				new Sphere( new Vector3(), 1 ).intersectsPlane( new Plane( new Vector3( 0, 1, 0 ), 1 ) ),
				'matches class intersectsPlane'
			);

		} );

		QUnit.test( 'sphereClampPoint / sphereGetBoundingBox', ( assert ) => {

			const s = sphereSet( { x: 1, y: 1, z: 1 }, 1 );

			const clamped = sphereClampPoint( s, { x: 1, y: 1, z: 3 } );
			assert.ok(
				Math.abs( clamped.x - 1 ) <= eps &&
				Math.abs( clamped.y - 1 ) <= eps &&
				Math.abs( clamped.z - 2 ) <= eps,
				'clamps to sphere surface'
			);

			const box = sphereGetBoundingBox( s );
			assert.ok(
				Math.abs( box.min.x - 0 ) <= eps &&
				Math.abs( box.max.x - 2 ) <= eps &&
				Math.abs( box.min.y - 0 ) <= eps &&
				Math.abs( box.max.y - 2 ) <= eps,
				'bounding box matches expected'
			);

			const emptyBox = sphereGetBoundingBox( sphereCreate() );
			assert.ok( emptyBox.max.x < emptyBox.min.x, 'empty sphere → empty box' );

		} );

		QUnit.test( 'sphereApplyMatrix4 matches Sphere.applyMatrix4', ( assert ) => {

			const matrix = {
				elements: [
					1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					1, - 2, 1, 1
				]
			};

			const functional = sphereApplyMatrix4( sphereSet( { x: 1, y: 1, z: 1 }, 1 ), matrix );
			const classic = new Sphere( new Vector3( 1, 1, 1 ), 1 ).applyMatrix4(
				new Matrix4().makeTranslation( 1, - 2, 1 )
			);

			assert.ok( sphereLikeEquals( functional, classic ), 'matches class applyMatrix4' );

		} );

		QUnit.test( 'sphereExpandByPoint / sphereUnion aliasing safety', ( assert ) => {

			const a = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			sphereExpandByPoint( a, { x: 2, y: 0, z: 0 }, a );

			assert.ok( sphereLikeEquals( a, { center: { x: 0.5, y: 0, z: 0 }, radius: 1.5 } ), 'in-place expandByPoint' );

			const b = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			const c = sphereSet( { x: 2, y: 0, z: 0 }, 1 );
			sphereUnion( b, c, b );

			assert.ok( sphereLikeEquals( b, { center: { x: 1, y: 0, z: 0 }, radius: 2 } ), 'in-place union' );

			// d contains c (demonstrates why it is necessary to process two points in union)
			const d = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			const e = sphereSet( { x: 1, y: 0, z: 0 }, 4 );
			sphereUnion( d, e, d );

			assert.ok( sphereLikeEquals( d, { center: { x: 1, y: 0, z: 0 }, radius: 4 } ), 'union containment case' );

			// same center
			const f = sphereSet( { x: 0, y: 0, z: 0 }, 1 );
			const g = sphereSet( { x: 0, y: 0, z: 0 }, 4 );
			sphereUnion( f, g, f );

			assert.ok( sphereLikeEquals( f, { center: { x: 0, y: 0, z: 0 }, radius: 4 } ), 'same-center union' );

		} );

		QUnit.test( 'sphereToJSON / sphereFromJSON round-trip', ( assert ) => {

			const s = sphereSet( { x: 1, y: 2, z: 3 }, 4 );
			const json = sphereToJSON( s );
			const restored = sphereFromJSON( json );

			assert.deepEqual( json, { radius: 4, center: [ 1, 2, 3 ] }, 'json shape' );
			assert.ok( sphereEquals( s, restored ), 'round-trip equals' );

		} );

		QUnit.test( 'class wrapper stays behavior-compatible with functional results', ( assert ) => {

			const plain = sphereSet( { x: 2, y: 0, z: 0 }, 3 );
			const classic = new Sphere( new Vector3( 2, 0, 0 ), 3 );

			assert.ok( sphereEquals( plain, classic ), 'Sphere satisfies SphereLike for equals' );
			assert.ok( classic.equals( plain ), 'Sphere.equals accepts a plain SphereLike' );

		} );

	} );

} );
