import {
	box2ClampPoint,
	box2ContainsBox,
	box2ContainsPoint,
	box2Copy,
	box2Create,
	box2DistanceToPoint,
	box2Equals,
	box2ExpandByPoint,
	box2ExpandByScalar,
	box2ExpandByVector,
	box2GetCenter,
	box2GetParameter,
	box2GetSize,
	box2Intersect,
	box2IntersectsBox,
	box2IsEmpty,
	box2MakeEmpty,
	box2Set,
	box2SetFromCenterAndSize,
	box2SetFromPoints,
	box2Translate,
	box2Union
} from '../../../../src/math/Box2Functions.js';
import { Box2 } from '../../../../src/math/Box2.js';
import { Vector2 } from '../../../../src/math/Vector2.js';
import { eps } from '../../utils/math-constants.js';

function numbersEqual( a, b, tolerance = eps ) {

	// Infinity === Infinity must hold; Math.abs( Inf - Inf ) is NaN
	return a === b || Math.abs( a - b ) <= tolerance;

}

function box2LikeEquals( a, b, tolerance = eps ) {

	return numbersEqual( a.min.x, b.min.x, tolerance ) &&
		numbersEqual( a.min.y, b.min.y, tolerance ) &&
		numbersEqual( a.max.x, b.max.x, tolerance ) &&
		numbersEqual( a.max.y, b.max.y, tolerance );

}

function vec2LikeEquals( a, b, tolerance = eps ) {

	return numbersEqual( a.x, b.x, tolerance ) &&
		numbersEqual( a.y, b.y, tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box2Functions', () => {

		QUnit.test( 'box2Create is a plain Box2Like, not a Box2 instance', ( assert ) => {

			const b = box2Create();

			assert.strictEqual( b.min.x, + Infinity, 'min.x is +Infinity' );
			assert.strictEqual( b.min.y, + Infinity, 'min.y is +Infinity' );
			assert.strictEqual( b.max.x, - Infinity, 'max.x is -Infinity' );
			assert.strictEqual( b.max.y, - Infinity, 'max.y is -Infinity' );
			assert.notOk( b.isBox2, 'is not branded as a Box2' );
			assert.ok( box2LikeEquals( b, new Box2() ), 'matches new Box2() numerically' );

		} );

		QUnit.test( 'operations work on plain objects without importing Box2', ( assert ) => {

			const a = box2Set( { x: 0, y: 0 }, { x: 2, y: 2 } );
			const b = box2ExpandByPoint( a, { x: - 1, y: 3 } );

			assert.ok( ! a.isBox2, 'set result is a plain Box2Like' );
			assert.ok( ! b.isBox2, 'expand result is a plain Box2Like' );
			assert.ok( box2LikeEquals( b, { min: { x: - 1, y: 0 }, max: { x: 2, y: 3 } } ), 'expand matches expected' );
			assert.ok( box2ContainsPoint( a, { x: 1, y: 1 } ), 'contains an interior point' );
			assert.notOk( box2ContainsPoint( a, { x: 3, y: 3 } ), 'rejects an exterior point' );

		} );

		QUnit.test( 'omitting the target allocates a new Box2Like, providing one reuses it', ( assert ) => {

			const source = box2Set( { x: 1, y: 2 }, { x: 3, y: 4 } );

			const allocated = box2Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( box2LikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = box2Create();
			const returned = box2Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( box2LikeEquals( reused, source ), 'the reused target matches the source' );

		} );

		QUnit.test( 'box2Set / box2Copy / box2Equals', ( assert ) => {

			const a = box2Set( { x: 1, y: 2 }, { x: 3, y: 4 } );
			const b = box2Copy( a );

			assert.ok( box2Equals( a, b ), 'copy equals source' );
			assert.notOk( box2Equals( a, box2Create() ), 'differs from empty' );

			b.max.x = 7;
			assert.notOk( box2Equals( a, b ), 'mutation of copy does not affect equality with source' );

		} );

		QUnit.test( 'box2SetFromPoints / box2SetFromCenterAndSize match the class', ( assert ) => {

			const points = [ { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 } ];
			const functional = box2SetFromPoints( points );
			const classic = new Box2().setFromPoints( points.map( ( p ) => new Vector2( p.x, p.y ) ) );

			assert.ok( box2LikeEquals( functional, classic ), 'setFromPoints matches class' );

			const fromCenter = box2SetFromCenterAndSize( { x: 1, y: 1 }, { x: 2, y: 2 } );
			const classicCenter = new Box2().setFromCenterAndSize( new Vector2( 1, 1 ), new Vector2( 2, 2 ) );

			assert.ok( box2LikeEquals( fromCenter, classicCenter ), 'setFromCenterAndSize matches class' );
			assert.ok( box2LikeEquals( fromCenter, { min: { x: 0, y: 0 }, max: { x: 2, y: 2 } } ), 'expected bounds' );

		} );

		QUnit.test( 'box2IsEmpty / box2MakeEmpty', ( assert ) => {

			assert.ok( box2IsEmpty( box2Create() ), 'default is empty' );
			assert.notOk( box2IsEmpty( box2Set( { x: 0, y: 0 }, { x: 0, y: 0 } ) ), 'degenerate point box is not empty' );
			assert.ok( box2IsEmpty( box2MakeEmpty() ), 'makeEmpty is empty' );

		} );

		QUnit.test( 'box2GetCenter / box2GetSize', ( assert ) => {

			const box = box2Set( { x: 0, y: 0 }, { x: 2, y: 4 } );
			const center = box2GetCenter( box );
			const size = box2GetSize( box );

			assert.ok( vec2LikeEquals( center, { x: 1, y: 2 } ), 'center' );
			assert.ok( vec2LikeEquals( size, { x: 2, y: 4 } ), 'size' );

			const emptyCenter = box2GetCenter( box2Create() );
			const emptySize = box2GetSize( box2Create() );
			assert.ok( vec2LikeEquals( emptyCenter, { x: 0, y: 0 } ), 'empty center is zero' );
			assert.ok( vec2LikeEquals( emptySize, { x: 0, y: 0 } ), 'empty size is zero' );

		} );

		QUnit.test( 'expand / translate / union / intersect aliasing safety', ( assert ) => {

			const a = box2Set( { x: 0, y: 0 }, { x: 2, y: 2 } );
			const b = box2Set( { x: 1, y: 1 }, { x: 3, y: 3 } );

			const expanded = box2ExpandByPoint( a, { x: - 1, y: 3 }, a );
			assert.strictEqual( expanded, a, 'expandByPoint reuses target' );
			assert.ok( box2LikeEquals( a, { min: { x: - 1, y: 0 }, max: { x: 2, y: 3 } } ), 'in-place expandByPoint' );

			box2Set( { x: 0, y: 0 }, { x: 2, y: 2 }, a );
			box2ExpandByVector( a, { x: 1, y: 1 }, a );
			assert.ok( box2LikeEquals( a, { min: { x: - 1, y: - 1 }, max: { x: 3, y: 3 } } ), 'in-place expandByVector' );

			box2Set( { x: 0, y: 0 }, { x: 2, y: 2 }, a );
			box2ExpandByScalar( a, 1, a );
			assert.ok( box2LikeEquals( a, { min: { x: - 1, y: - 1 }, max: { x: 3, y: 3 } } ), 'in-place expandByScalar' );

			box2Set( { x: 0, y: 0 }, { x: 2, y: 2 }, a );
			box2Translate( a, { x: 1, y: - 1 }, a );
			assert.ok( box2LikeEquals( a, { min: { x: 1, y: - 1 }, max: { x: 3, y: 1 } } ), 'in-place translate' );

			box2Set( { x: 0, y: 0 }, { x: 2, y: 2 }, a );
			box2Union( a, b, a );
			assert.ok( box2LikeEquals( a, { min: { x: 0, y: 0 }, max: { x: 3, y: 3 } } ), 'in-place union' );

			box2Set( { x: 0, y: 0 }, { x: 2, y: 2 }, a );
			box2Intersect( a, b, a );
			assert.ok( box2LikeEquals( a, { min: { x: 1, y: 1 }, max: { x: 2, y: 2 } } ), 'in-place intersect' );

		} );

		QUnit.test( 'box2Intersect of non-overlapping boxes makes the result empty', ( assert ) => {

			const a = box2Set( { x: 0, y: 0 }, { x: 1, y: 1 } );
			const b = box2Set( { x: 2, y: 2 }, { x: 3, y: 3 } );
			const result = box2Intersect( a, b );

			assert.ok( box2IsEmpty( result ), 'non-overlapping intersect is empty' );
			assert.ok( box2LikeEquals( result, box2Create() ), 'empty state matches makeEmpty' );

		} );

		QUnit.test( 'box2ContainsBox / box2IntersectsBox', ( assert ) => {

			const outer = box2Set( { x: 0, y: 0 }, { x: 4, y: 4 } );
			const inner = box2Set( { x: 1, y: 1 }, { x: 2, y: 2 } );
			const overlapping = box2Set( { x: 3, y: 3 }, { x: 5, y: 5 } );
			const far = box2Set( { x: 10, y: 10 }, { x: 11, y: 11 } );

			assert.ok( box2ContainsBox( outer, inner ), 'contains inner' );
			assert.notOk( box2ContainsBox( outer, overlapping ), 'does not contain overlapping' );
			assert.ok( box2IntersectsBox( outer, overlapping ), 'intersects overlapping' );
			assert.notOk( box2IntersectsBox( outer, far ), 'misses far' );

		} );

		QUnit.test( 'box2ClampPoint / box2DistanceToPoint / box2GetParameter', ( assert ) => {

			const box = box2Set( { x: 0, y: 0 }, { x: 2, y: 2 } );

			const clamped = box2ClampPoint( box, { x: 3, y: - 1 } );
			assert.ok( vec2LikeEquals( clamped, { x: 2, y: 0 } ), 'clamps to box edge' );

			assert.strictEqual( box2DistanceToPoint( box, { x: 1, y: 1 } ), 0, 'interior distance is 0' );
			assert.ok( Math.abs( box2DistanceToPoint( box, { x: 3, y: 2 } ) - 1 ) <= eps, 'exterior distance' );

			const param = box2GetParameter( box, { x: 1, y: 0.5 } );
			assert.ok( vec2LikeEquals( param, { x: 0.5, y: 0.25 } ), 'getParameter' );

		} );

		QUnit.test( 'functional results match Box2 class methods', ( assert ) => {

			const plain = box2Set( { x: - 1, y: - 2 }, { x: 3, y: 4 } );
			const classic = new Box2( new Vector2( - 1, - 2 ), new Vector2( 3, 4 ) );
			const point = { x: 5, y: - 3 };
			const offset = { x: 1, y: 2 };
			const other = box2Set( { x: 0, y: 0 }, { x: 1, y: 1 } );

			assert.ok( box2LikeEquals(
				box2ExpandByPoint( plain, point ),
				classic.clone().expandByPoint( new Vector2( point.x, point.y ) )
			), 'expandByPoint' );

			assert.ok( box2LikeEquals(
				box2Translate( plain, offset ),
				classic.clone().translate( new Vector2( offset.x, offset.y ) )
			), 'translate' );

			assert.ok( box2LikeEquals(
				box2Union( plain, other ),
				classic.clone().union( new Box2( new Vector2( 0, 0 ), new Vector2( 1, 1 ) ) )
			), 'union' );

			assert.strictEqual(
				box2DistanceToPoint( plain, point ),
				classic.distanceToPoint( new Vector2( point.x, point.y ) ),
				'distanceToPoint'
			);

			assert.strictEqual(
				box2Equals( plain, other ),
				classic.equals( new Box2( new Vector2( 0, 0 ), new Vector2( 1, 1 ) ) ),
				'equals'
			);

		} );

	} );

} );
