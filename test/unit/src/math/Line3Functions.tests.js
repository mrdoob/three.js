import {
	line3ApplyMatrix4,
	line3At,
	line3ClosestPointToPoint,
	line3ClosestPointToPointParameter,
	line3Copy,
	line3Create,
	line3Delta,
	line3Distance,
	line3DistanceSq,
	line3DistanceSqToLine3,
	line3Equals,
	line3GetCenter,
	line3Set
} from '../../../../src/math/Line3Functions.js';
import { Line3 } from '../../../../src/math/Line3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

function vec3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Line3Functions', () => {

		QUnit.test( 'line3Create is a plain Line3Like, not a Line3 instance', ( assert ) => {

			const line = line3Create();

			assert.strictEqual( line.start.x, 0, 'start.x is 0' );
			assert.strictEqual( line.start.y, 0, 'start.y is 0' );
			assert.strictEqual( line.start.z, 0, 'start.z is 0' );
			assert.strictEqual( line.end.x, 0, 'end.x is 0' );
			assert.strictEqual( line.end.y, 0, 'end.y is 0' );
			assert.strictEqual( line.end.z, 0, 'end.z is 0' );
			assert.notOk( line.isLine3, 'is not branded as a Line3' );
			assert.ok( line3Equals( line, new Line3() ), 'is numerically a zero-length line at the origin' );

		} );

		QUnit.test( 'operations work on plain objects without importing Line3', ( assert ) => {

			const line = line3Set(
				{ x: 0, y: 0, z: 0 },
				{ x: 2, y: 4, z: 6 }
			);

			const center = line3GetCenter( line );
			const delta = line3Delta( line );
			const atMid = line3At( line, 0.5 );

			assert.ok( ! center.isVector3, 'getCenter result is a plain Vector3Like' );
			assert.ok( vec3LikeEquals( center, { x: 1, y: 2, z: 3 } ), 'center matches' );
			assert.ok( vec3LikeEquals( delta, { x: 2, y: 4, z: 6 } ), 'delta matches' );
			assert.ok( vec3LikeEquals( atMid, { x: 1, y: 2, z: 3 } ), 'at(0.5) matches center' );
			assert.numEqual( line3DistanceSq( line ), 56, 'distanceSq matches' );
			assert.numEqual( line3Distance( line ), Math.sqrt( 56 ), 'distance matches' );

		} );

		QUnit.test( 'omitting the target allocates a new Line3Like, providing one reuses it', ( assert ) => {

			const source = line3Set( { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } );

			const allocated = line3Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.notStrictEqual( allocated.start, source.start, 'start is a distinct object' );
			assert.ok( line3Equals( allocated, source ), 'the allocated copy matches the source' );

			const reused = line3Create();
			const returned = line3Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( line3Equals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'vector-producing helpers allocate or reuse their Vector3Like target', ( assert ) => {

			const line = line3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 } );

			const allocated = line3GetCenter( line );
			assert.ok( vec3LikeEquals( allocated, { x: 1, y: 0, z: 0 } ), 'allocated center is correct' );

			const reused = { x: - 1, y: - 1, z: - 1 };
			const returned = line3GetCenter( line, reused );
			assert.strictEqual( returned, reused, 'the provided vector target is returned' );
			assert.ok( vec3LikeEquals( reused, { x: 1, y: 0, z: 0 } ), 'the provided vector target holds the result' );

		} );

		QUnit.test( 'applyMatrix4 is safe when the target aliases the input', ( assert ) => {

			const line = line3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 2, z: 2 } );
			const matrix = { elements: new Matrix4().makeTranslation( 1, 2, 3 ).elements };

			const expected = line3ApplyMatrix4( line, matrix );
			const aliased = line3Copy( line );
			line3ApplyMatrix4( aliased, matrix, aliased );

			assert.ok( line3Equals( aliased, expected ), 'in-place applyMatrix4 matches out-of-place' );
			assert.ok( vec3LikeEquals( aliased.start, { x: 1, y: 2, z: 3 } ), 'translated start' );
			assert.ok( vec3LikeEquals( aliased.end, { x: 3, y: 4, z: 5 } ), 'translated end' );

		} );

		QUnit.test( 'closestPointToPointParameter handles clamped, unclamped, and degenerate lines', ( assert ) => {

			const line = line3Set( { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 2 } );

			assert.strictEqual( line3ClosestPointToPointParameter( line, { x: 0, y: 0, z: 0 }, true ), 0, 'clamped below start' );
			assert.strictEqual( line3ClosestPointToPointParameter( line, { x: 0, y: 0, z: 0 }, false ), - 1, 'unclamped below start' );
			assert.strictEqual( line3ClosestPointToPointParameter( line, { x: 1, y: 1, z: 5 }, true ), 1, 'clamped above end' );

			const point = line3ClosestPointToPoint( line, { x: 0, y: 0, z: 0 }, false );
			assert.ok( vec3LikeEquals( point, { x: 1, y: 1, z: 0 } ), 'unclamped closest point' );

			const degenerate = line3Set( { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 1 } );
			assert.strictEqual( line3ClosestPointToPointParameter( degenerate, { x: 0, y: 0, z: 0 }, true ), 0, 'degenerate line parameter is 0' );
			assert.ok( vec3LikeEquals(
				line3ClosestPointToPoint( degenerate, { x: 0, y: 0, z: 0 }, true ),
				{ x: 1, y: 1, z: 1 }
			), 'degenerate closest point is the start' );

		} );

		QUnit.test( 'distanceSqToLine3 matches class behavior on intersecting, parallel, and skew lines', ( assert ) => {

			const line1 = line3Set( { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 } );
			const line2 = line3Set( { x: 1, y: 10, z: 0 }, { x: 1, y: - 2, z: 0 } );

			assert.numEqual( line3DistanceSqToLine3( line1, line2 ), 0, 'intersecting segments' );

			line3Set( { x: - 2, y: 0, z: 2 }, { x: 20, y: 0, z: 2 }, line2 );
			assert.numEqual( line3DistanceSqToLine3( line1, line2 ), 4, 'parallel segments' );

			line3Set( { x: 4, y: 0, z: 0 }, { x: - 4, y: 0, z: 0 }, line1 );
			line3Set( { x: 0, y: 4, z: 0 }, { x: 0, y: 0, z: 4 }, line2 );
			assert.numEqual( line3DistanceSqToLine3( line1, line2 ), 8, 'skew segments' );

			const c1 = { x: 0, y: 0, z: 0 };
			const c2 = { x: 0, y: 0, z: 0 };
			line3DistanceSqToLine3( line1, line2, c1, c2 );
			assert.ok( vec3LikeEquals( c1, { x: 0, y: 0, z: 0 } ), 'closest point on first line' );
			assert.ok( vec3LikeEquals( c2, { x: 0, y: 2, z: 2 } ), 'closest point on second line' );

		} );

		QUnit.test( 'distanceSqToLine3 handles degenerate segments', ( assert ) => {

			const pointA = line3Set( { x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 } );
			const pointB = line3Set( { x: 4, y: 6, z: 3 }, { x: 4, y: 6, z: 3 } );

			assert.numEqual( line3DistanceSqToLine3( pointA, pointB ), 25, 'two point-segments' );

			const segment = line3Set( { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 } );
			const point = line3Set( { x: 5, y: 3, z: 0 }, { x: 5, y: 3, z: 0 } );
			assert.numEqual( line3DistanceSqToLine3( segment, point ), 9, 'segment to point-segment' );

		} );

		QUnit.test( 'results match the Line3 class wrapper', ( assert ) => {

			const plain = line3Set( { x: 0, y: 4, z: 0 }, { x: 2, y: 2, z: 0 } );
			const other = line3Set( { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 } );
			const klass = new Line3( new Vector3( 0, 4, 0 ), new Vector3( 2, 2, 0 ) );
			const otherKlass = new Line3( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ) );

			assert.numEqual( line3DistanceSq( plain ), klass.distanceSq(), 'distanceSq' );
			assert.numEqual( line3Distance( plain ), klass.distance(), 'distance' );
			assert.numEqual(
				line3DistanceSqToLine3( plain, other ),
				klass.distanceSqToLine3( otherKlass ),
				'distanceSqToLine3'
			);

			const plainPoint = line3ClosestPointToPoint( plain, { x: 0, y: 0, z: 0 }, true );
			const classPoint = klass.closestPointToPoint( new Vector3( 0, 0, 0 ), true, new Vector3() );
			assert.ok( vec3LikeEquals( plainPoint, classPoint ), 'closestPointToPoint' );

		} );

	} );

} );
