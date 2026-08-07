import {
	vec2Add,
	vec2AddScaledVector,
	vec2AddVectors,
	vec2Angle,
	vec2AngleTo,
	vec2ApplyMatrix3,
	vec2ClampLength,
	vec2Copy,
	vec2Create,
	vec2Cross,
	vec2DistanceTo,
	vec2DistanceToSquared,
	vec2Divide,
	vec2Dot,
	vec2Equals,
	vec2FromArray,
	vec2Length,
	vec2LengthSq,
	vec2Lerp,
	vec2Multiply,
	vec2MultiplyScalar,
	vec2Negate,
	vec2Normalize,
	vec2RotateAround,
	vec2Set,
	vec2SetComponent,
	vec2SetLength,
	vec2Sub,
	vec2ToArray
} from '../../../../src/math/Vector2Functions.js';
import { Vector2 } from '../../../../src/math/Vector2.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { eps } from '../../utils/math-constants.js';

function vector2LikeEquals( a, b, tolerance = eps ) {

	return ( Math.abs( a.x - b.x ) <= tolerance ) && ( Math.abs( a.y - b.y ) <= tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector2Functions', () => {

		QUnit.test( 'vec2Create is a plain Vector2Like, not a Vector2 instance', ( assert ) => {

			const v = vec2Create();

			assert.strictEqual( v.x, 0, 'default x is 0' );
			assert.strictEqual( v.y, 0, 'default y is 0' );
			assert.notOk( v.isVector2, 'is not branded as a Vector2' );
			assert.ok( vec2Equals( v, new Vector2() ), 'is numerically a zero vector' );

			const w = vec2Create( 3, 4 );
			assert.ok( vec2Equals( w, new Vector2( 3, 4 ) ), 'create with args matches Vector2' );

		} );

		QUnit.test( 'operations work on plain objects without importing Vector2', ( assert ) => {

			const a = { x: 1, y: 2 };
			const b = { x: 3, y: 4 };

			const sum = vec2Add( a, b );
			const product = vec2Multiply( a, b );
			const diff = vec2Sub( b, a );

			assert.ok( ! sum.isVector2, 'result is a plain Vector2Like' );
			assert.ok( vector2LikeEquals( sum, { x: 4, y: 6 } ), 'add matches expected' );
			assert.ok( vector2LikeEquals( product, { x: 3, y: 8 } ), 'multiply matches expected' );
			assert.ok( vector2LikeEquals( diff, { x: 2, y: 2 } ), 'sub matches expected' );
			assert.strictEqual( vec2Dot( a, b ), 11, 'dot matches expected' );
			assert.strictEqual( vec2Cross( a, b ), - 2, 'cross matches expected' );

		} );

		QUnit.test( 'omitting the target allocates a new Vector2Like, providing one reuses it', ( assert ) => {

			const source = { x: 5, y: 7 };

			const allocated = vec2Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( vec2Equals( allocated, source ), 'the allocated copy matches the source' );

			const reused = vec2Create();
			const returned = vec2Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( vec2Equals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'add / multiply / rotateAround are safe when the target aliases an input', ( assert ) => {

			const a = { x: 1, y: 2 };
			const b = { x: 3, y: 4 };
			const expectedAdd = vec2Add( a, b );
			const expectedMul = vec2Multiply( a, b );

			const aliasA = vec2Copy( a );
			vec2Add( aliasA, b, aliasA );
			assert.ok( vec2Equals( aliasA, expectedAdd ), 'add with target aliasing first arg is correct' );

			const aliasB = vec2Copy( b );
			vec2Add( a, aliasB, aliasB );
			assert.ok( vec2Equals( aliasB, expectedAdd ), 'add with target aliasing second arg is correct' );

			const aliasMul = vec2Copy( a );
			vec2Multiply( aliasMul, b, aliasMul );
			assert.ok( vec2Equals( aliasMul, expectedMul ), 'multiply with target aliasing first arg is correct' );

			const center = { x: 1, y: 1 };
			const v = { x: 2, y: 1 };
			const expectedRot = vec2RotateAround( v, center, Math.PI / 2 );
			vec2RotateAround( v, center, Math.PI / 2, v );
			assert.ok( vector2LikeEquals( v, expectedRot ), 'rotateAround in-place matches out-of-place' );

		} );

		QUnit.test( 'normalize / setLength / clampLength handle zero-length vectors', ( assert ) => {

			const zero = { x: 0, y: 0 };

			const normalized = vec2Normalize( zero );
			assert.ok( vec2Equals( normalized, { x: 0, y: 0 } ), 'normalize of zero stays zero' );

			const setLen = vec2SetLength( zero, 5 );
			assert.ok( vec2Equals( setLen, { x: 0, y: 0 } ), 'setLength of zero stays zero' );

			const clamped = vec2ClampLength( zero, 1, 2 );
			const classResult = new Vector2().clampLength( 1, 2 );
			assert.ok( vector2LikeEquals( clamped, classResult ), 'clampLength of zero matches Vector2' );

		} );

		QUnit.test( 'length, distance, and angle match the class on plain objects', ( assert ) => {

			const a = { x: 3, y: 4 };
			const b = { x: 0, y: 0 };

			assert.strictEqual( vec2Length( a ), 5, 'length' );
			assert.strictEqual( vec2LengthSq( a ), 25, 'lengthSq' );
			assert.strictEqual( vec2DistanceTo( a, b ), 5, 'distanceTo' );
			assert.strictEqual( vec2DistanceToSquared( a, b ), 25, 'distanceToSquared' );

			const unitX = { x: 1, y: 0 };
			const unitY = { x: 0, y: 1 };
			assert.ok( Math.abs( vec2Angle( unitX ) ) < eps, 'angle of +x is ~0' );
			assert.ok( Math.abs( vec2AngleTo( unitX, unitY ) - Math.PI / 2 ) < eps, 'angleTo is π/2' );

			const zero = { x: 0, y: 0 };
			assert.ok( Math.abs( vec2AngleTo( zero, unitX ) - Math.PI / 2 ) < eps, 'angleTo with zero length is π/2' );

		} );

		QUnit.test( 'applyMatrix3 works with a plain matrix-like elements array', ( assert ) => {

			const v = { x: 2, y: 3 };
			const m = { elements: [
				2, 0, 0,
				0, 3, 0,
				4, 5, 1
			] };

			const result = vec2ApplyMatrix3( v, m );
			assert.ok( vector2LikeEquals( result, new Vector2( 2, 3 ).applyMatrix3( new Matrix3().set(
				2, 0, 4,
				0, 3, 5,
				0, 0, 1
			) ) ), 'matches Matrix3 class result' );

		} );

		QUnit.test( 'fromArray / toArray / set / lerp / addVectors match expected values', ( assert ) => {

			const from = vec2FromArray( [ 9, 8, 1, 2 ], 2 );
			assert.ok( vec2Equals( from, { x: 1, y: 2 } ), 'fromArray with offset' );

			const arr = vec2ToArray( { x: 3, y: 4 } );
			assert.deepEqual( arr, [ 3, 4 ], 'toArray writes components' );

			assert.ok( vec2Equals( vec2Set( 7, 8 ), { x: 7, y: 8 } ), 'set' );

			const lerped = vec2Lerp( { x: 0, y: 0 }, { x: 10, y: 20 }, 0.5 );
			assert.ok( vec2Equals( lerped, { x: 5, y: 10 } ), 'lerp' );

			const summed = vec2AddVectors( { x: 1, y: 2 }, { x: 3, y: 4 } );
			assert.ok( vec2Equals( summed, { x: 4, y: 6 } ), 'addVectors' );

			const scaled = vec2AddScaledVector( { x: 1, y: 1 }, { x: 2, y: 3 }, 2 );
			assert.ok( vec2Equals( scaled, { x: 5, y: 7 } ), 'addScaledVector' );

			assert.ok( vec2Equals( vec2Negate( { x: 1, y: - 2 } ), { x: - 1, y: 2 } ), 'negate' );
			assert.ok( vec2Equals( vec2MultiplyScalar( { x: 2, y: 3 }, 2 ), { x: 4, y: 6 } ), 'multiplyScalar' );
			assert.ok( vec2Equals( vec2Divide( { x: 8, y: 6 }, { x: 2, y: 3 } ), { x: 4, y: 2 } ), 'divide' );

		} );

		QUnit.test( 'setComponent throws on out-of-range index', ( assert ) => {

			assert.throws( () => vec2SetComponent( { x: 0, y: 0 }, 2, 1 ), /out of range/, 'index 2 throws' );

		} );

		QUnit.test( 'functional results match Vector2 class methods', ( assert ) => {

			const a = vec2Create( 1, 2 );
			const b = vec2Create( 3, 4 );
			const ca = new Vector2( 1, 2 );
			const cb = new Vector2( 3, 4 );

			assert.ok( vector2LikeEquals( vec2Add( a, b ), ca.clone().add( cb ) ), 'add' );
			assert.ok( vector2LikeEquals( vec2Sub( a, b ), ca.clone().sub( cb ) ), 'sub' );
			assert.ok( vector2LikeEquals( vec2Normalize( a ), ca.clone().normalize() ), 'normalize' );
			assert.ok( vector2LikeEquals( vec2Lerp( a, b, 0.25 ), ca.clone().lerp( cb, 0.25 ) ), 'lerp' );
			assert.ok( vector2LikeEquals(
				vec2RotateAround( a, b, 0.7 ),
				ca.clone().rotateAround( cb, 0.7 )
			), 'rotateAround' );

		} );

	} );

} );
