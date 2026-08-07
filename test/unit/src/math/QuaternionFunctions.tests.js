import {
	quatAngleTo,
	quatConjugate,
	quatCopy,
	quatCreate,
	quatDot,
	quatEquals,
	quatFromArray,
	quatIdentity,
	quatInvert,
	quatLength,
	quatLengthSq,
	quatMultiply,
	quatMultiplyQuaternions,
	quatNormalize,
	quatPreMultiply,
	quatRotateTowards,
	quatSet,
	quatSetFromAxisAngle,
	quatSetFromEuler,
	quatSetFromRotationMatrix,
	quatSetFromUnitVectors,
	quatSlerp,
	quatSlerpFlat,
	quatSlerpQuaternions,
	quatToArray,
	quatMultiplyQuaternionsFlat
} from '../../../../src/math/QuaternionFunctions.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { mat4Create, mat4MakeRotationFromQuaternion } from '../../../../src/math/Matrix4Functions.js';
import { eps } from '../../utils/math-constants.js';

function quatLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a._x - b._x ) <= tolerance &&
		Math.abs( a._y - b._y ) <= tolerance &&
		Math.abs( a._z - b._z ) <= tolerance &&
		Math.abs( a._w - b._w ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'QuaternionFunctions', () => {

		QUnit.test( 'quatCreate is a plain QuaternionLike, not a Quaternion instance', ( assert ) => {

			const q = quatCreate();

			assert.strictEqual( q._x, 0, 'default x is 0' );
			assert.strictEqual( q._y, 0, 'default y is 0' );
			assert.strictEqual( q._z, 0, 'default z is 0' );
			assert.strictEqual( q._w, 1, 'default w is 1' );
			assert.notOk( q.isQuaternion, 'is not branded as a Quaternion' );
			assert.ok( quatEquals( q, new Quaternion() ), 'matches new Quaternion()' );

		} );

		QUnit.test( 'operations work on plain objects without importing Quaternion', ( assert ) => {

			const a = quatSet( 0, 1, 0, 0 );
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 2 );
			const product = quatMultiply( a, b );

			assert.ok( ! a.isQuaternion, 'set result is a plain QuaternionLike' );
			assert.ok( ! product.isQuaternion, 'multiply result is a plain QuaternionLike' );
			assert.ok( quatLikeEquals( product, new Quaternion().set( 0, 1, 0, 0 ).multiply(
				new Quaternion().setFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 2 )
			) ), 'matches the class result' );

			const array = quatToArray( a );
			assert.deepEqual( array, [ 0, 1, 0, 0 ], 'toArray matches components' );

			const fromArray = quatFromArray( [ 0.1, 0.2, 0.3, 0.4 ] );
			assert.ok( quatLikeEquals( fromArray, { _x: 0.1, _y: 0.2, _z: 0.3, _w: 0.4 } ), 'fromArray matches components' );

		} );

		QUnit.test( 'omitting the target allocates a new QuaternionLike, providing one reuses it', ( assert ) => {

			const source = { _x: 0.1, _y: 0.2, _z: 0.3, _w: 0.4 };

			const allocated = quatCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( quatEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = quatCreate();
			const returned = quatCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( quatEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'multiplyQuaternions is safe when the target aliases either input', ( assert ) => {

			const a = quatSetFromAxisAngle( { x: 1, y: 0, z: 0 }, 0.4 );
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, 0.6 );
			const expected = quatMultiplyQuaternions( a, b );

			const aliasA = quatCopy( a );
			quatMultiplyQuaternions( aliasA, b, aliasA );
			assert.ok( quatLikeEquals( aliasA, expected ), 'target aliasing the first argument produces the correct result' );

			const aliasB = quatCopy( b );
			quatMultiplyQuaternions( a, aliasB, aliasB );
			assert.ok( quatLikeEquals( aliasB, expected ), 'target aliasing the second argument produces the correct result' );

		} );

		QUnit.test( 'slerp is safe when the target aliases the first input', ( assert ) => {

			const a = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, 0 );
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 2 );
			const expected = quatSlerp( a, b, 0.3 );

			const aliased = quatCopy( a );
			quatSlerp( aliased, b, 0.3, aliased );
			assert.ok( quatLikeEquals( aliased, expected ), 'in-place slerp matches out-of-place slerp' );

		} );

		QUnit.test( 'normalize handles the zero-length quaternion', ( assert ) => {

			const zero = quatSet( 0, 0, 0, 0 );
			const normalized = quatNormalize( zero );

			assert.ok( quatEquals( normalized, quatIdentity() ), 'zero-length normalizes to identity' );

			const aliased = quatSet( 0, 0, 0, 0 );
			quatNormalize( aliased, aliased );
			assert.ok( quatEquals( aliased, quatIdentity() ), 'in-place zero-length normalize yields identity' );

		} );

		QUnit.test( 'multiply/preMultiply match the class multiply/premultiply argument order', ( assert ) => {

			const a = quatSetFromAxisAngle( { x: 1, y: 0, z: 0 }, Math.PI / 3 );
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 4 );

			const postMultiplied = quatMultiply( a, b );
			const classPost = new Quaternion().copy( a ).multiply( new Quaternion().copy( b ) );
			assert.ok( quatLikeEquals( postMultiplied, classPost ), 'quatMultiply matches Quaternion#multiply' );

			const preMultiplied = quatPreMultiply( a, b );
			const classPre = new Quaternion().copy( a ).premultiply( new Quaternion().copy( b ) );
			assert.ok( quatLikeEquals( preMultiplied, classPre ), 'quatPreMultiply matches Quaternion#premultiply' );

		} );

		QUnit.test( 'conjugate / invert / identity / length helpers', ( assert ) => {

			const q = quatSet( 1, 2, 3, 4 );
			const conjugated = quatConjugate( q );

			assert.ok( quatLikeEquals( conjugated, { _x: - 1, _y: - 2, _z: - 3, _w: 4 } ), 'conjugate negates xyz' );
			assert.ok( quatEquals( quatInvert( q ), conjugated ), 'invert matches conjugate' );
			assert.strictEqual( quatDot( q, q ), quatLengthSq( q ), 'dot with self equals lengthSq' );
			assert.ok( Math.abs( quatLength( q ) - Math.sqrt( quatLengthSq( q ) ) ) < eps, 'length matches sqrt(lengthSq)' );
			assert.ok( quatEquals( quatIdentity(), { _x: 0, _y: 0, _z: 0, _w: 1 } ), 'identity is (0,0,0,1)' );

		} );

		QUnit.test( 'setFromEuler / setFromRotationMatrix / setFromUnitVectors on plain objects', ( assert ) => {

			const euler = { _x: 0.3, _y: - 0.6, _z: 0.9, _order: 'XYZ' };
			const fromEuler = quatSetFromEuler( euler );
			const classFromEuler = new Quaternion().setFromEuler( {
				_x: 0.3, _y: - 0.6, _z: 0.9, _order: 'XYZ'
			} );

			assert.ok( quatLikeEquals( fromEuler, classFromEuler ), 'setFromEuler matches the class' );

			const m = mat4MakeRotationFromQuaternion( fromEuler, mat4Create() );
			const fromMatrix = quatSetFromRotationMatrix( m );
			assert.ok( quatLikeEquals( fromMatrix, fromEuler ), 'setFromRotationMatrix recovers the quaternion' );

			const from = { x: 1, y: 0, z: 0 };
			const to = { x: 0, y: 1, z: 0 };
			const fromVectors = quatSetFromUnitVectors( from, to );
			const classFromVectors = new Quaternion().setFromUnitVectors( from, to );
			assert.ok( quatLikeEquals( fromVectors, classFromVectors ), 'setFromUnitVectors matches the class' );

		} );

		QUnit.test( 'angleTo / rotateTowards / slerpQuaternions', ( assert ) => {

			const a = quatIdentity();
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI );

			assert.ok( Math.abs( quatAngleTo( a, b ) - Math.PI ) < eps, 'angleTo is PI for opposite rotations' );

			const stepped = quatRotateTowards( a, b, Math.PI / 4 );
			assert.ok( Math.abs( quatAngleTo( a, stepped ) - Math.PI / 4 ) < eps, 'rotateTowards steps by the given angle' );

			const same = quatRotateTowards( a, a, 1 );
			assert.ok( quatEquals( same, a ), 'rotateTowards with zero angle returns the start' );

			const slerped = quatSlerpQuaternions( a, b, 0.5 );
			assert.ok( Math.abs( quatAngleTo( a, slerped ) - Math.PI / 2 ) < eps, 'slerpQuaternions halfway is PI/2' );

		} );

		QUnit.test( 'slerpFlat / multiplyQuaternionsFlat operate on flat arrays', ( assert ) => {

			const a = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, 0 );
			const b = quatSetFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 2 );
			const src0 = quatToArray( a );
			const src1 = quatToArray( b );
			const dst = [];

			quatSlerpFlat( dst, 0, src0, 0, src1, 0, 0.5 );
			const expected = quatSlerp( a, b, 0.5 );
			assert.ok( quatLikeEquals( quatFromArray( dst ), expected ), 'slerpFlat matches quatSlerp' );

			const mulDst = [];
			quatMultiplyQuaternionsFlat( mulDst, 0, src0, 0, src1, 0 );
			assert.ok( quatLikeEquals( quatFromArray( mulDst ), quatMultiply( a, b ) ), 'multiplyQuaternionsFlat matches quatMultiply' );

		} );

	} );

} );
