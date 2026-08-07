import {
	box3ApplyMatrix4,
	box3ClampPoint,
	box3ContainsBox,
	box3ContainsPoint,
	box3Copy,
	box3Create,
	box3DistanceToPoint,
	box3Equals,
	box3ExpandByPoint,
	box3ExpandByScalar,
	box3ExpandByVector,
	box3FromJSON,
	box3GetBoundingSphere,
	box3GetCenter,
	box3GetSize,
	box3Intersect,
	box3IntersectsBox,
	box3IntersectsPlane,
	box3IntersectsSphere,
	box3IntersectsTriangle,
	box3IsEmpty,
	box3MakeEmpty,
	box3Set,
	box3SetFromArray,
	box3SetFromCenterAndSize,
	box3SetFromPoints,
	box3ToJSON,
	box3Translate,
	box3Union
} from '../../../../src/math/Box3Functions.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { eps } from '../../utils/math-constants.js';

function box3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.min.x - b.min.x ) <= tolerance &&
		Math.abs( a.min.y - b.min.y ) <= tolerance &&
		Math.abs( a.min.z - b.min.z ) <= tolerance &&
		Math.abs( a.max.x - b.max.x ) <= tolerance &&
		Math.abs( a.max.y - b.max.y ) <= tolerance &&
		Math.abs( a.max.z - b.max.z ) <= tolerance;

}

function vec3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box3Functions', () => {

		QUnit.test( 'box3Create is a plain Box3Like, not a Box3 instance', ( assert ) => {

			const box = box3Create();

			assert.strictEqual( typeof box.min.x, 'number', 'has min.x' );
			assert.strictEqual( typeof box.max.x, 'number', 'has max.x' );
			assert.notOk( box.isBox3, 'is not branded as a Box3' );
			assert.ok( box3IsEmpty( box ), 'default state is empty' );
			assert.ok( box3Equals( box, new Box3() ), 'matches new Box3() numerically' );

		} );

		QUnit.test( 'operations work on plain objects without importing Box3', ( assert ) => {

			const a = box3Set( { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 } );
			const b = box3Set( { x: 0.5, y: 0.5, z: 0.5 }, { x: 2, y: 2, z: 2 } );

			const united = box3Union( a, b );

			assert.ok( ! united.isBox3, 'result is a plain Box3Like' );
			assert.ok( box3LikeEquals( united, {
				min: { x: 0, y: 0, z: 0 },
				max: { x: 2, y: 2, z: 2 }
			} ), 'union matches expected bounds' );

			const center = box3GetCenter( a );
			assert.ok( ! center.isVector3, 'getCenter returns a plain Vector3Like' );
			assert.ok( vec3LikeEquals( center, { x: 0.5, y: 0.5, z: 0.5 } ), 'center is correct' );

		} );

		QUnit.test( 'omitting the target allocates a new Box3Like, providing one reuses it', ( assert ) => {

			const source = box3Set( { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } );

			const allocated = box3Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( box3LikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = box3Create();
			const returned = box3Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( box3LikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'expand/union/intersect are safe when the target aliases an input', ( assert ) => {

			const a = box3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 2 } );
			const b = box3Set( { x: 1, y: 1, z: 1 }, { x: 3, y: 3, z: 3 } );

			const expectedUnion = box3Union( a, b );
			const aliasUnion = box3Copy( a );
			box3Union( aliasUnion, b, aliasUnion );
			assert.ok( box3LikeEquals( aliasUnion, expectedUnion ), 'in-place union matches out-of-place' );

			const expectedIntersect = box3Intersect( a, b );
			const aliasIntersect = box3Copy( a );
			box3Intersect( aliasIntersect, b, aliasIntersect );
			assert.ok( box3LikeEquals( aliasIntersect, expectedIntersect ), 'in-place intersect matches out-of-place' );

			const expectedExpand = box3ExpandByPoint( a, { x: - 1, y: 4, z: 0.5 } );
			const aliasExpand = box3Copy( a );
			box3ExpandByPoint( aliasExpand, { x: - 1, y: 4, z: 0.5 }, aliasExpand );
			assert.ok( box3LikeEquals( aliasExpand, expectedExpand ), 'in-place expandByPoint matches out-of-place' );

		} );

		QUnit.test( 'empty and degenerate boxes match class behavior', ( assert ) => {

			const empty = box3Create();
			assert.ok( box3IsEmpty( empty ), 'default create is empty' );

			box3MakeEmpty( empty );
			assert.ok( box3IsEmpty( empty ), 'makeEmpty is empty' );

			const point = box3Set( { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 } );
			assert.notOk( box3IsEmpty( point ), 'a zero-volume point box is not empty' );
			assert.ok( box3ContainsPoint( point, { x: 1, y: 1, z: 1 } ), 'point box contains its point' );

			const noOverlap = box3Intersect(
				box3Set( { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 } ),
				box3Set( { x: 2, y: 2, z: 2 }, { x: 3, y: 3, z: 3 } )
			);
			assert.ok( box3IsEmpty( noOverlap ), 'non-overlapping intersect yields empty' );

		} );

		QUnit.test( 'setFromArray / setFromPoints / setFromCenterAndSize', ( assert ) => {

			const fromArray = box3SetFromArray( [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ] );
			assert.ok( box3LikeEquals( fromArray, {
				min: { x: 0, y: 0, z: 0 },
				max: { x: 2, y: 2, z: 2 }
			} ), 'setFromArray encloses all points' );

			const fromPoints = box3SetFromPoints( [
				{ x: - 1, y: 0, z: 0 },
				{ x: 1, y: 2, z: 3 }
			] );
			assert.ok( box3LikeEquals( fromPoints, {
				min: { x: - 1, y: 0, z: 0 },
				max: { x: 1, y: 2, z: 3 }
			} ), 'setFromPoints encloses all points' );

			const fromCenter = box3SetFromCenterAndSize(
				{ x: 0, y: 0, z: 0 },
				{ x: 2, y: 4, z: 6 }
			);
			assert.ok( box3LikeEquals( fromCenter, {
				min: { x: - 1, y: - 2, z: - 3 },
				max: { x: 1, y: 2, z: 3 }
			} ), 'setFromCenterAndSize is correct' );

		} );

		QUnit.test( 'getSize / clampPoint / distanceToPoint / translate', ( assert ) => {

			const box = box3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 4, z: 6 } );

			assert.ok( vec3LikeEquals( box3GetSize( box ), { x: 2, y: 4, z: 6 } ), 'getSize' );

			const clamped = box3ClampPoint( box, { x: - 5, y: 2, z: 100 } );
			assert.ok( vec3LikeEquals( clamped, { x: 0, y: 2, z: 6 } ), 'clampPoint' );

			assert.ok( Math.abs( box3DistanceToPoint( box, { x: - 3, y: 2, z: 3 } ) - 3 ) < eps, 'distanceToPoint' );
			assert.strictEqual( box3DistanceToPoint( box, { x: 1, y: 2, z: 3 } ), 0, 'distance inside is 0' );

			const moved = box3Translate( box, { x: 1, y: - 1, z: 0 } );
			assert.ok( box3LikeEquals( moved, {
				min: { x: 1, y: - 1, z: 0 },
				max: { x: 3, y: 3, z: 6 }
			} ), 'translate' );

		} );

		QUnit.test( 'contains / intersects helpers', ( assert ) => {

			const box = box3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 2 } );
			const inside = box3Set( { x: 0.5, y: 0.5, z: 0.5 }, { x: 1.5, y: 1.5, z: 1.5 } );
			const overlapping = box3Set( { x: 1.5, y: 1.5, z: 1.5 }, { x: 3, y: 3, z: 3 } );
			const outside = box3Set( { x: 3, y: 3, z: 3 }, { x: 4, y: 4, z: 4 } );

			assert.ok( box3ContainsPoint( box, { x: 1, y: 1, z: 1 } ), 'containsPoint inside' );
			assert.notOk( box3ContainsPoint( box, { x: 3, y: 1, z: 1 } ), 'containsPoint outside' );
			assert.ok( box3ContainsBox( box, inside ), 'containsBox' );
			assert.notOk( box3ContainsBox( box, overlapping ), 'does not contain overlapping' );
			assert.ok( box3IntersectsBox( box, overlapping ), 'intersects overlapping' );
			assert.notOk( box3IntersectsBox( box, outside ), 'does not intersect outside' );

			assert.ok( box3IntersectsSphere( box, { center: { x: 3, y: 1, z: 1 }, radius: 1.1 } ), 'intersectsSphere' );
			assert.notOk( box3IntersectsSphere( box, { center: { x: 5, y: 1, z: 1 }, radius: 1 } ), 'misses sphere' );

			assert.ok( box3IntersectsPlane( box, { normal: { x: 1, y: 0, z: 0 }, constant: - 1 } ), 'intersectsPlane' );
			assert.notOk( box3IntersectsPlane( box, { normal: { x: 1, y: 0, z: 0 }, constant: - 5 } ), 'misses plane' );

			assert.ok( box3IntersectsTriangle( box, {
				a: { x: 1, y: 1, z: 1 },
				b: { x: 3, y: 1, z: 1 },
				c: { x: 1, y: 3, z: 1 }
			} ), 'intersectsTriangle' );
			assert.notOk( box3IntersectsTriangle( box3Create(), {
				a: { x: 0, y: 0, z: 0 },
				b: { x: 1, y: 0, z: 0 },
				c: { x: 0, y: 1, z: 0 }
			} ), 'empty box misses triangle' );

		} );

		QUnit.test( 'applyMatrix4 is alias-safe and transforms corners', ( assert ) => {

			const box = box3Set( { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 } );
			const matrix = {
				elements: [
					2, 0, 0, 0,
					0, 3, 0, 0,
					0, 0, 4, 0,
					5, 6, 7, 1
				]
			};

			const outOfPlace = box3ApplyMatrix4( box, matrix );
			const aliased = box3Copy( box );
			box3ApplyMatrix4( aliased, matrix, aliased );
			assert.ok( box3LikeEquals( aliased, outOfPlace ), 'in-place applyMatrix4 matches out-of-place' );

			assert.ok( outOfPlace.min.x === 5 && outOfPlace.max.x === 7, 'translation+scale x' );
			assert.ok( outOfPlace.min.y === 6 && outOfPlace.max.y === 9, 'translation+scale y' );
			assert.ok( outOfPlace.min.z === 7 && outOfPlace.max.z === 11, 'translation+scale z' );

			assert.ok( box3IsEmpty( box3ApplyMatrix4( box3Create(), matrix ) ), 'empty stays empty' );

		} );

		QUnit.test( 'expandByScalar / expandByVector', ( assert ) => {

			const box = box3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 2 } );

			assert.ok( box3LikeEquals(
				box3ExpandByScalar( box, 1 ),
				{ min: { x: - 1, y: - 1, z: - 1 }, max: { x: 3, y: 3, z: 3 } }
			), 'expandByScalar' );

			assert.ok( box3LikeEquals(
				box3ExpandByVector( box, { x: 1, y: 0, z: 2 } ),
				{ min: { x: - 1, y: 0, z: - 2 }, max: { x: 3, y: 2, z: 4 } }
			), 'expandByVector' );

		} );

		QUnit.test( 'getBoundingSphere / toJSON / fromJSON', ( assert ) => {

			const box = box3Set( { x: - 1, y: - 1, z: - 1 }, { x: 1, y: 1, z: 1 } );
			const sphere = box3GetBoundingSphere( box );

			assert.ok( vec3LikeEquals( sphere.center, { x: 0, y: 0, z: 0 } ), 'sphere center' );
			assert.ok( Math.abs( sphere.radius - Math.sqrt( 3 ) ) < eps, 'sphere radius' );

			const emptySphere = box3GetBoundingSphere( box3Create() );
			assert.strictEqual( emptySphere.radius, - 1, 'empty box yields empty sphere' );

			const json = box3ToJSON( box );
			const restored = box3FromJSON( json );
			assert.ok( box3LikeEquals( restored, box ), 'fromJSON round-trips toJSON' );

		} );

		QUnit.test( 'matches Box3 class results for core ops', ( assert ) => {

			const plainA = box3Set( { x: - 2, y: - 1, z: 0 }, { x: 1, y: 2, z: 3 } );
			const plainB = box3Set( { x: 0, y: 0, z: 0 }, { x: 4, y: 1, z: 1 } );

			const classA = new Box3().copy( plainA );
			const classB = new Box3().copy( plainB );

			assert.ok( box3LikeEquals( box3Union( plainA, plainB ), classA.clone().union( classB ) ), 'union' );
			assert.ok( box3LikeEquals( box3Intersect( plainA, plainB ), classA.clone().intersect( classB ) ), 'intersect' );
			assert.ok( box3LikeEquals(
				box3ExpandByPoint( plainA, { x: 5, y: - 3, z: 1 } ),
				classA.clone().expandByPoint( { x: 5, y: - 3, z: 1 } )
			), 'expandByPoint' );

		} );

	} );

} );
