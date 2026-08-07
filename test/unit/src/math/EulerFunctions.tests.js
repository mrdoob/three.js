import {
	EULER_DEFAULT_ORDER,
	eulerCopy,
	eulerCreate,
	eulerEquals,
	eulerFromArray,
	eulerReorder,
	eulerSet,
	eulerSetFromQuaternion,
	eulerSetFromRotationMatrix,
	eulerSetFromVector3,
	eulerToArray
} from '../../../../src/math/EulerFunctions.js';
import { Euler } from '../../../../src/math/Euler.js';
import { mat4Create, mat4MakeRotationFromQuaternion } from '../../../../src/math/Matrix4Functions.js';
import { quatSetFromEuler } from '../../../../src/math/QuaternionFunctions.js';
import { eps } from '../../utils/math-constants.js';

function eulerLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a._x - b._x ) <= tolerance &&
		Math.abs( a._y - b._y ) <= tolerance &&
		Math.abs( a._z - b._z ) <= tolerance &&
		a._order === b._order;

}

function quatLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a._x - b._x ) <= tolerance &&
		Math.abs( a._y - b._y ) <= tolerance &&
		Math.abs( a._z - b._z ) <= tolerance &&
		Math.abs( a._w - b._w ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'EulerFunctions', () => {

		QUnit.test( 'eulerCreate is a plain EulerLike, not an Euler instance', ( assert ) => {

			const e = eulerCreate();

			assert.strictEqual( e._x, 0, 'default x' );
			assert.strictEqual( e._y, 0, 'default y' );
			assert.strictEqual( e._z, 0, 'default z' );
			assert.strictEqual( e._order, EULER_DEFAULT_ORDER, 'default order' );
			assert.strictEqual( EULER_DEFAULT_ORDER, 'XYZ', 'EULER_DEFAULT_ORDER is XYZ' );
			assert.notOk( e.isEuler, 'is not branded as an Euler' );
			assert.ok( eulerEquals( e, new Euler() ), 'matches new Euler()' );

		} );

		QUnit.test( 'operations work on plain objects without importing Euler', ( assert ) => {

			const a = eulerSet( 1, 0, 0, 'XYZ' );
			const b = eulerCopy( a );
			const fromVector = eulerSetFromVector3( { x: 0.2, y: 0.3, z: 0.4 }, 'YZX' );

			assert.ok( ! a.isEuler, 'set result is a plain EulerLike' );
			assert.ok( ! b.isEuler, 'copy result is a plain EulerLike' );
			assert.ok( eulerEquals( a, b ), 'copy matches source' );
			assert.ok( eulerLikeEquals( fromVector, { _x: 0.2, _y: 0.3, _z: 0.4, _order: 'YZX' } ), 'setFromVector3 writes components' );

			const array = eulerToArray( a );
			assert.deepEqual( array, [ 1, 0, 0, 'XYZ' ], 'toArray matches components' );

			const fromArray = eulerFromArray( [ 0.5, 0.6, 0.7, 'ZXY' ] );
			assert.ok( eulerLikeEquals( fromArray, { _x: 0.5, _y: 0.6, _z: 0.7, _order: 'ZXY' } ), 'fromArray matches components' );

		} );

		QUnit.test( 'omitting the target allocates a new EulerLike, providing one reuses it', ( assert ) => {

			const source = { _x: 1, _y: 2, _z: 3, _order: 'YXZ' };

			const allocated = eulerCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( eulerEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = eulerCreate();
			const returned = eulerCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( eulerEquals( reused, source ), 'the provided target holds the result' );

			const setTarget = eulerCreate();
			assert.strictEqual( eulerSet( 4, 5, 6, 'ZYX', setTarget ), setTarget, 'set reuses target' );
			assert.ok( eulerEquals( setTarget, { _x: 4, _y: 5, _z: 6, _order: 'ZYX' } ), 'set writes into target' );

		} );

		QUnit.test( 'reorder is safe when the target aliases the input', ( assert ) => {

			const source = eulerSet( 0.4, - 0.2, 0.7, 'XYZ' );
			const expected = eulerReorder( source, 'YZX' );

			const aliased = eulerCopy( source );
			eulerReorder( aliased, 'YZX', aliased );

			assert.ok( eulerLikeEquals( aliased, expected ), 'in-place reorder matches out-of-place reorder' );

			const q0 = quatSetFromEuler( source );
			const q1 = quatSetFromEuler( aliased );
			assert.ok( quatLikeEquals( q0, q1 ), 'reorder preserves the equivalent quaternion' );

		} );

		QUnit.test( 'setFromQuaternion / setFromRotationMatrix round-trip on plain objects', ( assert ) => {

			const original = eulerSet( 0.3, - 0.6, 0.9, 'XYZ' );
			const q = quatSetFromEuler( original );
			const fromQuat = eulerSetFromQuaternion( q, 'XYZ' );

			assert.ok( eulerLikeEquals( fromQuat, original ), 'setFromQuaternion recovers the original angles' );

			const m = mat4MakeRotationFromQuaternion( q, mat4Create() );
			const fromMatrix = eulerSetFromRotationMatrix( m, 'XYZ' );

			assert.ok( eulerLikeEquals( fromMatrix, original ), 'setFromRotationMatrix recovers the original angles' );

			const q2 = quatSetFromEuler( fromMatrix );
			assert.ok( quatLikeEquals( q, q2 ), 'matrix round-trip preserves the quaternion' );

		} );

		QUnit.test( 'gimbal-lock (singular) rotation matrices match the class', ( assert ) => {

			// m13 = 1 forces the XYZ gimbal-lock branch (abs(m13) >= 0.9999999).
			const singular = {
				elements: [
					0, 0, - 1, 0,
					0, 1, 0, 0,
					1, 0, 0, 0,
					0, 0, 0, 1
				]
			};

			const functional = eulerSetFromRotationMatrix( singular, 'XYZ' );
			const wrapped = new Euler().setFromRotationMatrix( singular, 'XYZ' );

			assert.ok( eulerLikeEquals( functional, wrapped ), 'XYZ gimbal-lock matches the class' );
			assert.strictEqual( functional._z, 0, 'locked XYZ sets z to 0' );

		} );

		QUnit.test( 'class wrapper delegates to the same math', ( assert ) => {

			const plain = eulerSetFromVector3( { x: 0.1, y: 0.2, z: 0.3 }, 'XZY' );
			const wrapped = new Euler().setFromVector3( { x: 0.1, y: 0.2, z: 0.3 }, 'XZY' );

			assert.ok( eulerEquals( plain, wrapped ), 'class setFromVector3 matches functional result' );

			const q = quatSetFromEuler( plain );
			const plainFromQ = eulerSetFromQuaternion( q, 'XZY' );
			const wrappedFromQ = new Euler().setFromQuaternion( q, 'XZY', true );

			assert.ok( eulerLikeEquals( plainFromQ, wrappedFromQ ), 'class setFromQuaternion matches functional result' );

		} );

	} );

} );
